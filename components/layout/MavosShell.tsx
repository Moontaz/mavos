"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import { projects } from "@/data/projects";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseCommand } from "@/lib/voice/commandParser";
import type { VoiceCommand, VoiceState } from "@/lib/types";
import { CommandGuide } from "@/components/voice/CommandGuide";
import { CommandPalette } from "@/components/voice/CommandPalette";
import { OnboardingOverlay } from "@/components/voice/OnboardingOverlay";
import { VoiceDock } from "@/components/voice/VoiceDock";

interface MavosContextValue {
   voiceState: VoiceState;
   transcript: string;
   interimTranscript: string;
   command: VoiceCommand | null;
   history: VoiceCommand[];
   isListening: boolean;
   wakeListening: boolean;
   isSupported: boolean;
   voiceOpen: boolean;
   guideOpen: boolean;
   paletteOpen: boolean;
   onboardingOpen: boolean;
   tutorialMode: boolean;
   errorMessage: string | null;
   startListening: () => void;
   startWakeWordListening: () => void;
   stopListening: () => void;
   toggleVoice: () => void;
   openGuide: () => void;
   closeGuide: () => void;
   openPalette: () => void;
   closePalette: () => void;
   setTutorialMode: (value: boolean) => void;
   completeOnboarding: () => void;
   reopenOnboarding: () => void;
   executeCommand: (nextCommand: VoiceCommand) => void;
}

const MavosContext = createContext<MavosContextValue | null>(null);

export function useMavos() {
   const context = useContext(MavosContext);
   if (!context) throw new Error("useMavos must be used inside MavosShell");
   return context;
}

export function MavosShell({ children }: { children: ReactNode }) {
   return (
      <MavosProvider>
         <Navigation />
         <main>{children}</main>
         <VoiceDock />
         <CommandGuide />
         <CommandPalette />
         <OnboardingOverlay />
      </MavosProvider>
   );
}

function MavosProvider({ children }: { children: ReactNode }) {
   const router = useRouter();
   const pathname = usePathname();
   const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
   const [transcript, setTranscript] = useState("");
   const [command, setCommand] = useState<VoiceCommand | null>(null);
   const [history, setHistory] = useState<VoiceCommand[]>([]);
   const [voiceOpen, setVoiceOpen] = useState(false);
   const [guideOpen, setGuideOpen] = useState(false);
   const [paletteOpen, setPaletteOpen] = useState(false);
   const [onboardingOpen, setOnboardingOpen] = useState(false);
   const [tutorialMode, setTutorialMode] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const executionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
   const lastCommand = useRef({ value: "", at: 0 });
   const previousPath = useRef(pathname);
   const sessionStatus = useRef({ isListening: false, wakeListening: false });

   const executeCommand = useCallback(
      (nextCommand: VoiceCommand) => {
         const now = Date.now();
         if (
            lastCommand.current.value === nextCommand.rawTranscript &&
            now - lastCommand.current.at < 1800
         )
            return;
         lastCommand.current = { value: nextCommand.rawTranscript, at: now };
         setHistory((items) => [nextCommand, ...items].slice(0, 4));
         setVoiceState("EXECUTING");
         setErrorMessage(null);
         executionTimer.current = setTimeout(() => {
            switch (nextCommand.action) {
               case "SHOW_HOME":
                  router.push("/");
                  break;
               case "SHOW_EXPERIENCE":
                  router.push("/experience");
                  break;
               case "SHOW_PROJECTS":
                  router.push("/projects");
                  break;
               case "SHOW_ABOUT":
                  router.push("/about");
                  break;
               case "OPEN_PROJECT":
                  if (nextCommand.projectSlug)
                     router.push(`/projects/${nextCommand.projectSlug}`);
                  break;
               case "GO_BACK":
                  router.back();
                  break;
               case "GO_FORWARD":
                  window.history.forward();
                  break;
               case "NEXT_PROJECT": {
                  const currentSlug = pathname.split("/")[2];
                  const currentIndex = projects.findIndex(
                     (item) => item.slug === currentSlug,
                  );
                  router.push(
                     `/projects/${projects[(currentIndex + 1) % projects.length].slug}`,
                  );
                  break;
               }
               case "PREVIOUS_PROJECT": {
                  const currentSlug = pathname.split("/")[2];
                  const currentIndex = projects.findIndex(
                     (item) => item.slug === currentSlug,
                  );
                  const index =
                     currentIndex <= 0 ? projects.length - 1 : currentIndex - 1;
                  router.push(`/projects/${projects[index].slug}`);
                  break;
               }
               case "HELP":
                  setGuideOpen(true);
                  break;
               case "SHOW_COMMANDS":
                  setGuideOpen(true);
                  break;
               default:
                  break;
            }
            setVoiceState("SUCCESS");
            setTimeout(() => setVoiceState("IDLE"), 900);
         }, 420);
      },
      [pathname, router],
   );

   const handleFinalTranscript = useCallback(
      (value: string) => {
         setTranscript(value);
         setVoiceState("PROCESSING");
         const parsed = parseCommand(value);
         if (!parsed) {
            setCommand(null);
            setErrorMessage("I DIDN'T CATCH THAT. TRY HELP.");
            setVoiceState("ERROR");
            setTimeout(() => setVoiceState("IDLE"), 1800);
            return;
         }
         setCommand(parsed);
         setVoiceState("COMMAND_RECOGNIZED");
         if (!tutorialMode) {
            if (executionTimer.current) clearTimeout(executionTimer.current);
            executionTimer.current = setTimeout(
               () => executeCommand(parsed),
               620,
            );
         } else {
            setVoiceState("SUCCESS");
         }
      },
      [executeCommand, tutorialMode],
   );

   const handleListeningChange = useCallback((listening: boolean) => {
      setVoiceState((current) => {
         if (listening) return "LISTENING";
         return current === "LISTENING" || current === "INITIALIZING"
            ? "IDLE"
            : current;
      });
   }, []);

   const handleWakeWord = useCallback(() => {
      setVoiceOpen(true);
      setTranscript("hey mavos");
      setErrorMessage(null);
      setVoiceState("LISTENING");
   }, []);

   const speech = useSpeechRecognition({
      onFinalTranscript: handleFinalTranscript,
      onListeningChange: handleListeningChange,
      onWakeWord: handleWakeWord,
   });
   const {
      error,
      interimTranscript,
      isListening,
      wakeListening,
      isSupported,
      start,
      startWakeWordListening,
      stop,
   } = speech;
   sessionStatus.current = { isListening, wakeListening };

   useEffect(() => {
      if (error) {
         setErrorMessage(
            error === "not-allowed"
               ? "MICROPHONE ACCESS DENIED"
               : "SOMETHING WENT WRONG",
         );
         setVoiceState("ERROR");
      }
   }, [error]);

   useEffect(() => {
      try {
         if (!window.localStorage.getItem("mavos_onboarding_completed"))
            setOnboardingOpen(true);
      } catch {
         setOnboardingOpen(true);
      }
   }, []);

   useEffect(() => {
      return () => {
         if (executionTimer.current) clearTimeout(executionTimer.current);
         stop();
      };
   }, [stop]);

   const startWakeWord = useCallback(() => {
      if (!isSupported) return;
      const started = startWakeWordListening();
      if (!started) setVoiceState("ERROR");
   }, [isSupported, startWakeWordListening]);

   useEffect(() => {
      if (previousPath.current !== pathname) {
         if (
            sessionStatus.current.isListening ||
            sessionStatus.current.wakeListening
         )
            stop();
         try {
            if (window.localStorage.getItem("mavos_onboarding_completed")) {
               const timer = window.setTimeout(startWakeWord, 500);
               previousPath.current = pathname;
               return () => window.clearTimeout(timer);
            }
         } catch {
            // Private browsing may not expose localStorage; manual voice still works.
         }
      }
      previousPath.current = pathname;
   }, [pathname, startWakeWord, stop]);

   useEffect(() => {
      let timer: number | undefined;
      try {
         if (window.localStorage.getItem("mavos_onboarding_completed")) {
            timer = window.setTimeout(startWakeWord, 500);
         }
      } catch {
         // The user can still start voice interaction from the button.
      }
      return () => {
         if (timer) window.clearTimeout(timer);
      };
   }, [startWakeWord]);

   const startListening = useCallback(() => {
      setVoiceOpen(true);
      setVoiceState("INITIALIZING");
      if (!isSupported) {
         setVoiceState("UNSUPPORTED");
         return;
      }
      if (wakeListening) {
         stop();
         window.setTimeout(() => {
            const started = start();
            if (!started) setVoiceState("ERROR");
         }, 160);
         return;
      }
      const started = start();
      if (!started) setVoiceState("ERROR");
   }, [isSupported, start, stop, wakeListening]);

   const stopListening = useCallback(() => {
      stop();
      setVoiceState("IDLE");
   }, [stop]);

   const toggleVoice = useCallback(() => {
      if (isListening) stopListening();
      else startListening();
   }, [isListening, startListening, stopListening]);

   const completeOnboarding = useCallback(() => {
      try {
         window.localStorage.setItem("mavos_onboarding_completed", "true");
      } catch {
         /* private browsing */
      }
      setTutorialMode(false);
      setOnboardingOpen(false);
      setVoiceState("IDLE");
      stop();
      window.setTimeout(startWakeWord, 220);
   }, [startWakeWord, stop]);

   const reopenOnboarding = useCallback(() => {
      setOnboardingOpen(true);
      setTutorialMode(false);
   }, []);

   const value = useMemo<MavosContextValue>(
      () => ({
         voiceState,
         transcript,
         interimTranscript,
         command,
         history,
         isListening,
         wakeListening,
         isSupported,
         voiceOpen,
         guideOpen,
         paletteOpen,
         onboardingOpen,
         tutorialMode,
         errorMessage,
         startListening,
         startWakeWordListening: startWakeWord,
         stopListening,
         toggleVoice,
         openGuide: () => setGuideOpen(true),
         closeGuide: () => setGuideOpen(false),
         openPalette: () => setPaletteOpen(true),
         closePalette: () => setPaletteOpen(false),
         setTutorialMode,
         completeOnboarding,
         reopenOnboarding,
         executeCommand,
      }),
      [
         voiceState,
         transcript,
         interimTranscript,
         command,
         history,
         isListening,
         wakeListening,
         isSupported,
         voiceOpen,
         guideOpen,
         paletteOpen,
         onboardingOpen,
         tutorialMode,
         errorMessage,
         startListening,
         startWakeWord,
         stopListening,
         toggleVoice,
         completeOnboarding,
         reopenOnboarding,
         executeCommand,
      ],
   );

   return (
      <MavosContext.Provider value={value}>{children}</MavosContext.Provider>
   );
}

function Navigation() {
   const pathname = usePathname();
   const { toggleVoice, isListening, wakeListening, openGuide, openPalette } =
      useMavos();
   const [menuOpen, setMenuOpen] = useState(false);
   const links = [
      { href: "/", label: "Home" },
      { href: "/experience", label: "Experience" },
      { href: "/projects", label: "Projects" },
      { href: "/about", label: "About" },
   ];

   useEffect(() => setMenuOpen(false), [pathname]);
   useEffect(() => {
      const onKey = (event: KeyboardEvent) => {
         if (
            (event.metaKey || event.ctrlKey) &&
            event.key.toLowerCase() === "k"
         ) {
            event.preventDefault();
            openPalette();
         }
         if (event.key === "?" && document.activeElement?.tagName !== "INPUT")
            openGuide();
         if (
            event.code === "Space" &&
            document.activeElement?.tagName !== "INPUT"
         ) {
            event.preventDefault();
            toggleVoice();
         }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
   }, [openGuide, openPalette, toggleVoice]);

   return (
      <header className="site-header">
         <Link href="/" className="wordmark" aria-label="MAVOS home">
            <span>M</span>AVOS<span className="wordmark-dot">—</span>
         </Link>
         <nav
            className={`site-nav ${menuOpen ? "is-open" : ""}`}
            aria-label="Primary navigation"
         >
            {links.map((link) => (
               <Link
                  key={link.href}
                  href={link.href}
                  className={
                     pathname === link.href ||
                     (link.href !== "/" && pathname.startsWith(link.href))
                        ? "active"
                        : ""
                  }
               >
                  {link.label}
               </Link>
            ))}
            <button className="nav-command" onClick={openGuide}>
               What can I say?
            </button>
         </nav>
         <div className="header-actions">
            <button
               className={`voice-trigger ${isListening || wakeListening ? "is-listening" : ""}`}
               onClick={toggleVoice}
               aria-label={
                  isListening || wakeListening
                     ? "Stop listening"
                     : "Start voice control"
               }
            >
               <span className="voice-trigger-line" />
               {isListening || wakeListening ? "Stop" : "Voice"}
               <span className="voice-trigger-key">Hey MAVOS</span>
            </button>
            <button
               className="menu-trigger"
               onClick={() => setMenuOpen((value) => !value)}
               aria-label="Toggle navigation"
               aria-expanded={menuOpen}
            >
               <span />
               <span />
            </button>
         </div>
      </header>
   );
}
