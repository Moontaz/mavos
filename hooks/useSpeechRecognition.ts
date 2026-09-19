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
   maxAlternatives: number;
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

type WindowWithSpeech = Window & {
   SpeechRecognition?: SpeechRecognitionConstructor;
   webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

/** Actual state reported by the browser engine. */
type EngineState = "idle" | "starting" | "running" | "stopping";

export type RecognitionLanguage = "en-US" | "id-ID";

interface UseSpeechRecognitionOptions {
   onFinalTranscript?: (transcript: string) => void;
   onListeningChange?: (listening: boolean) => void;
   language?: RecognitionLanguage;
}

/** Silence window after the last speech activity before the session closes. */
const SILENCE_WINDOW_MS = 3000;
/** Initial grace period so the user has time to start speaking after pressing Space. */
const INITIAL_WINDOW_MS = 6000;
const RESTART_DELAY_MS = 220;

export function useSpeechRecognition({
   onFinalTranscript,
   onListeningChange,
   language = "en-US",
}: UseSpeechRecognitionOptions = {}) {
   const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
   const activeRef = useRef(false);
   const engineRef = useRef<EngineState>("idle");
   const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const languageRef = useRef<RecognitionLanguage>(language);

   const finalCallbackRef = useRef(onFinalTranscript);
   const listeningCallbackRef = useRef(onListeningChange);
   const controlsRef = useRef<{ setActive: (active: boolean) => void } | null>(
      null,
   );

   const [isSupported, setIsSupported] = useState(true);
   const [isListening, setIsListening] = useState(false);
   const [interimTranscript, setInterimTranscript] = useState("");
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      finalCallbackRef.current = onFinalTranscript;
      listeningCallbackRef.current = onListeningChange;
   }, [onFinalTranscript, onListeningChange]);

   useEffect(() => {
      languageRef.current = language;
      if (recognitionRef.current) recognitionRef.current.lang = language;
   }, [language]);

   useEffect(() => {
      const speechWindow = window as WindowWithSpeech;
      const Recognition =
         speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

      if (!Recognition) {
         setIsSupported(false);
         return;
      }

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.lang = languageRef.current;
      recognitionRef.current = recognition;

      const clearRestartTimer = () => {
         if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
         restartTimerRef.current = null;
      };

      const clearSilenceTimer = () => {
         if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
         silenceTimerRef.current = null;
      };

      const armSilenceWindow = (duration: number) => {
         clearSilenceTimer();
         silenceTimerRef.current = setTimeout(() => {
            if (activeRef.current) setActive(false);
         }, duration);
      };

      /** Single entry point for engine control; prevents overlapping start/stop. */
      const syncEngine = () => {
         const engine = engineRef.current;

         if (!activeRef.current) {
            clearRestartTimer();
            if (engine === "running" || engine === "starting") {
               engineRef.current = "stopping";
               try {
                  recognition.stop();
               } catch {
                  engineRef.current = "idle";
               }
            }
            return;
         }

         if (engine === "idle") {
            engineRef.current = "starting";
            try {
               recognition.start();
            } catch {
               // InvalidStateError means the engine is still winding down; retry shortly.
               engineRef.current = "idle";
               clearRestartTimer();
               restartTimerRef.current = setTimeout(() => {
                  restartTimerRef.current = null;
                  if (activeRef.current) syncEngine();
               }, RESTART_DELAY_MS);
            }
         }
      };

      function setActive(next: boolean) {
         if (activeRef.current === next) {
            if (next) syncEngine();
            return;
         }
         activeRef.current = next;
         setInterimTranscript("");
         if (next) armSilenceWindow(INITIAL_WINDOW_MS);
         else clearSilenceTimer();
         setIsListening(next);
         listeningCallbackRef.current?.(next);
         syncEngine();
      }

      recognition.onstart = () => {
         engineRef.current = "running";
         setError(null);
         if (!activeRef.current) syncEngine();
      };

      recognition.onend = () => {
         engineRef.current = "idle";
         // Browsers end the session on silence; restart while the user still wants to listen.
         if (activeRef.current) {
            clearRestartTimer();
            restartTimerRef.current = setTimeout(() => {
               restartTimerRef.current = null;
               if (activeRef.current) syncEngine();
            }, RESTART_DELAY_MS);
         }
      };

      recognition.onerror = (event) => {
         // Recoverable: the user simply has not spoken yet.
         if (event.error === "no-speech" || event.error === "aborted") return;
         setError(event.error);
         setActive(false);
      };

      recognition.onresult = (event) => {
         if (!activeRef.current) return;
         let interim = "";
         let final = "";
         for (
            let index = event.resultIndex;
            index < event.results.length;
            index += 1
         ) {
            const result = event.results[index];
            if (result.isFinal) final += `${result[0].transcript} `;
            else interim += `${result[0].transcript} `;
         }

         setInterimTranscript(interim.trim());
         // Speech activity keeps the window open so long sentences are never cut.
         if (interim.trim() || final.trim())
            armSilenceWindow(SILENCE_WINDOW_MS);

         const trimmed = final.trim();
         if (!trimmed) return;
         setActive(false);
         finalCallbackRef.current?.(trimmed);
      };

      controlsRef.current = { setActive };

      return () => {
         activeRef.current = false;
         controlsRef.current = null;
         clearRestartTimer();
         clearSilenceTimer();
         recognition.onstart = null;
         recognition.onend = null;
         recognition.onresult = null;
         recognition.onerror = null;
         try {
            recognition.abort();
         } catch {
            // The engine may already be torn down.
         }
         engineRef.current = "idle";
         recognitionRef.current = null;
      };
   }, []);

   const start = useCallback(() => {
      if (!controlsRef.current) return false;
      setError(null);
      controlsRef.current.setActive(true);
      return true;
   }, []);

   const stop = useCallback(() => {
      controlsRef.current?.setActive(false);
   }, []);

   return { isSupported, isListening, interimTranscript, error, start, stop };
}
