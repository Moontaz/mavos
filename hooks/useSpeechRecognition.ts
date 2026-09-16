"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultEventLike = Event & {
   resultIndex: number;
   results: {
      length: number;
      [index: number]: {
         isFinal: boolean;
         0: { transcript: string };
      };
   };
};

type SpeechRecognitionErrorEventLike = Event & { error: string };

type SpeechRecognitionLike = {
   continuous: boolean;
   interimResults: boolean;
   lang: string;
   onstart: (() => void) | null;
   onend: (() => void) | null;
   onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
   onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
   start: () => void;
   stop: () => void;
   abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type RecognitionMode = "off" | "wake" | "command";

type WindowWithSpeech = Window & {
   SpeechRecognition?: SpeechRecognitionConstructor;
   webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

interface UseSpeechRecognitionOptions {
   onFinalTranscript?: (transcript: string) => void;
   onListeningChange?: (listening: boolean) => void;
   onWakeWord?: () => void;
   onWakeListeningChange?: (listening: boolean) => void;
}

const wakeWordPattern = /\b(?:hey|hi)\s+mavos\b/i;

export function useSpeechRecognition({
   onFinalTranscript,
   onListeningChange,
   onWakeWord,
   onWakeListeningChange,
}: UseSpeechRecognitionOptions = {}) {
   const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
   const modeRef = useRef<RecognitionMode>("off");
   const sessionActiveRef = useRef(false);
   const hasFinalResultRef = useRef(false);
   const fatalErrorRef = useRef(false);
   const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const commandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const finishSessionRef = useRef<(() => void) | null>(null);
   const wakeBufferRef = useRef("");
   const finalCallbackRef = useRef(onFinalTranscript);
   const listeningCallbackRef = useRef(onListeningChange);
   const wakeCallbackRef = useRef(onWakeWord);
   const wakeListeningCallbackRef = useRef(onWakeListeningChange);
   const [isSupported, setIsSupported] = useState(true);
   const [isListening, setIsListening] = useState(false);
   const [wakeListening, setWakeListening] = useState(false);
   const [interimTranscript, setInterimTranscript] = useState("");
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      finalCallbackRef.current = onFinalTranscript;
      listeningCallbackRef.current = onListeningChange;
      wakeCallbackRef.current = onWakeWord;
      wakeListeningCallbackRef.current = onWakeListeningChange;
   }, [
      onFinalTranscript,
      onListeningChange,
      onWakeWord,
      onWakeListeningChange,
   ]);

   useEffect(() => {
      const speechWindow = window as WindowWithSpeech;
      const Recognition =
         speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

      if (!Recognition) {
         setIsSupported(false);
         return;
      }

      const recognition = new Recognition();
      // Keeping one session alive lets the browser wait for the wake phrase.
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      const clearTimers = () => {
         if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
         if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
         restartTimerRef.current = null;
         commandTimerRef.current = null;
      };

      const finishSession = () => {
         sessionActiveRef.current = false;
         modeRef.current = "off";
         clearTimers();
         recognition.stop();
         setIsListening(false);
         setWakeListening(false);
         listeningCallbackRef.current?.(false);
         wakeListeningCallbackRef.current?.(false);
         setInterimTranscript("");
      };

      finishSessionRef.current = finishSession;

      const finishCommand = (value: string) => {
         if (!value.trim() || modeRef.current !== "command") return;
         hasFinalResultRef.current = true;
         finalCallbackRef.current?.(value.trim());
         finishSession();
      };

      const armCommandWindow = () => {
         if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
         commandTimerRef.current = setTimeout(() => {
            if (modeRef.current === "command") finishSession();
         }, 3000);
      };

      const activateCommandMode = (remainder = "") => {
         wakeBufferRef.current = "";
         modeRef.current = "command";
         hasFinalResultRef.current = false;
         setWakeListening(false);
         setIsListening(true);
         wakeListeningCallbackRef.current?.(false);
         listeningCallbackRef.current?.(true);
         wakeCallbackRef.current?.();
         armCommandWindow();
         if (remainder.trim()) finishCommand(remainder);
      };

      const scheduleRestart = () => {
         if (!sessionActiveRef.current || restartTimerRef.current) return;
         restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null;
            if (!sessionActiveRef.current) return;
            try {
               recognition.start();
            } catch {
               scheduleRestart();
            }
         }, 180);
      };

      recognition.onstart = () => {
         setError(null);
         if (modeRef.current === "wake") {
            setWakeListening(true);
            wakeListeningCallbackRef.current?.(true);
         } else if (modeRef.current === "command") {
            setIsListening(true);
            listeningCallbackRef.current?.(true);
         }
      };

      recognition.onend = () => {
         if (
            sessionActiveRef.current &&
            !hasFinalResultRef.current &&
            !fatalErrorRef.current
         ) {
            scheduleRestart();
            return;
         }
         if (!sessionActiveRef.current) {
            setIsListening(false);
            setWakeListening(false);
            return;
         }
         finishSession();
      };

      recognition.onerror = (event) => {
         // Browsers emit no-speech when the user pauses. Keep wake listening alive.
         if (event.error === "no-speech" || event.error === "aborted") return;
         if (!sessionActiveRef.current) return;
         fatalErrorRef.current = true;
         setError(event.error);
         finishSession();
      };

      recognition.onresult = (event) => {
         let interim = "";
         let final = "";
         for (
            let index = event.resultIndex;
            index < event.results.length;
            index += 1
         ) {
            const result = event.results[index];
            if (result.isFinal) final += result[0].transcript;
            else interim += result[0].transcript;
         }

         if (modeRef.current === "command") setInterimTranscript(interim);
         if (!final.trim()) return;

         if (modeRef.current === "wake") {
            wakeBufferRef.current = `${wakeBufferRef.current} ${final}`
               .trim()
               .split(/\s+/)
               .slice(-8)
               .join(" ");
            const wakeMatch = wakeBufferRef.current.match(wakeWordPattern);
            if (!wakeMatch || wakeMatch.index === undefined) return;
            const remainder = wakeBufferRef.current
               .slice(wakeMatch.index + wakeMatch[0].length)
               .trim();
            activateCommandMode(remainder);
            return;
         }

         finishCommand(final);
      };

      recognitionRef.current = recognition;

      return () => {
         sessionActiveRef.current = false;
         modeRef.current = "off";
         clearTimers();
         recognition.onstart = null;
         recognition.onend = null;
         recognition.onresult = null;
         recognition.onerror = null;
         finishSessionRef.current = null;
         recognition.abort();
         recognitionRef.current = null;
      };
   }, []);

   const start = useCallback(() => {
      const recognition = recognitionRef.current;
      if (!recognition || sessionActiveRef.current) return false;
      sessionActiveRef.current = true;
      modeRef.current = "command";
      wakeBufferRef.current = "";
      hasFinalResultRef.current = false;
      fatalErrorRef.current = false;
      setError(null);
      setInterimTranscript("");
      try {
         // Manual listening stays active until a command is recognized or Stop is pressed.
         // The three-second window is armed only after the wake phrase.
         recognition.start();
         return true;
      } catch {
         sessionActiveRef.current = false;
         modeRef.current = "off";
         setError("start-failed");
         return false;
      }
   }, []);

   const startWakeWordListening = useCallback(() => {
      const recognition = recognitionRef.current;
      if (!recognition || sessionActiveRef.current) return false;
      sessionActiveRef.current = true;
      modeRef.current = "wake";
      wakeBufferRef.current = "";
      hasFinalResultRef.current = false;
      fatalErrorRef.current = false;
      setError(null);
      setInterimTranscript("");
      try {
         recognition.start();
         return true;
      } catch {
         sessionActiveRef.current = false;
         modeRef.current = "off";
         setError("start-failed");
         return false;
      }
   }, []);

   const stop = useCallback(() => {
      sessionActiveRef.current = false;
      modeRef.current = "off";
      fatalErrorRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
      restartTimerRef.current = null;
      commandTimerRef.current = null;
      recognitionRef.current?.stop();
      setIsListening(false);
      setWakeListening(false);
      listeningCallbackRef.current?.(false);
      wakeListeningCallbackRef.current?.(false);
      setInterimTranscript("");
   }, []);

   return {
      isSupported,
      isListening,
      wakeListening,
      interimTranscript,
      error,
      start,
      startWakeWordListening,
      stop,
   };
}
