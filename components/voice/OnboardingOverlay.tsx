"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useMavos } from "@/components/layout/MavosShell";
import type { OnboardingStep } from "@/lib/types";

const stepCopy = {
   intro: {
      number: "01 / 04",
      title: (
         <>
            MAVOS IS A<br />
            <em>VOICE-CONTROLLED</em>
            <br />
            WEB EXPERIENCE.
         </>
      ),
      body: (
         <>
            Navigate, explore, and interact using your voice.
            <br />
            The interface listens for intent, not perfect phrasing.
         </>
      ),
   },
   how: {
      number: "02 / 04",
      title: (
         <>
            SPEAK
            <br />
            <em>NATURALLY.</em>
         </>
      ),
      body: (
         <>
            You do not need to remember complex commands.
            <br />
            Tell MAVOS what you want to do.
         </>
      ),
   },
   permission: {
      number: "03 / 04",
      title: (
         <>
            GIVE YOUR
            <br />
            <em>VOICE ROOM.</em>
         </>
      ),
      body: (
         <>
            MAVOS uses your browser microphone to hear commands.
            <br />
            Audio stays in the browser for visualization; speech recognition is
            provided by your browser.
         </>
      ),
   },
   check: {
      number: "04 / 04",
      title: (
         <>
            LET’S
            <br />
            <em>TRY IT.</em>
         </>
      ),
      body: (
         <>
            Say <strong>“SHOW MY PROJECTS”</strong> when you see LISTENING.
         </>
      ),
   },
};

export function OnboardingOverlay() {
   const {
      onboardingOpen,
      voiceState,
      transcript,
      command,
      isSupported,
      startListening,
      setTutorialMode,
      completeOnboarding,
   } = useMavos();
   const [step, setStep] = useState<OnboardingStep>("intro");
   const contentRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!onboardingOpen) return;
      setStep("intro");
      const previousBodyOverflow = document.body.style.overflow;
      const previousDocumentOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
         document.body.style.overflow = previousBodyOverflow;
         document.documentElement.style.overflow = previousDocumentOverflow;
      };
   }, [onboardingOpen]);

   useEffect(() => {
      if (!contentRef.current || !onboardingOpen) return;
      gsap.fromTo(
         contentRef.current.querySelectorAll("[data-reveal]"),
         { y: 18, opacity: 0 },
         { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out" },
      );
   }, [step, onboardingOpen]);

   if (!onboardingOpen) return null;
   const copy = stepCopy[step === "complete" ? "check" : step];
   const tutorialSuccess =
      step === "check" &&
      (command?.action === "SHOW_PROJECTS" || /project/i.test(transcript)) &&
      voiceState === "SUCCESS";

   const next = () => {
      if (step === "intro") setStep("how");
      else if (step === "how") setStep("permission");
      else if (step === "permission") {
         setTutorialMode(true);
         setStep("check");
         startListening();
      }
   };

   const skip = () => completeOnboarding();

   return (
      <div
         className="onboarding"
         role="dialog"
         aria-modal="true"
         aria-labelledby="onboarding-title"
      >
         <div className="onboarding-grid" />
         <div className="onboarding-top">
            <span>MAVOS / INITIALIZING</span>
            <span>MY VOICE</span>
         </div>
         <div className="onboarding-content" ref={contentRef}>
            <span className="eyebrow" data-reveal>
               {copy.number}
            </span>
            <h1 id="onboarding-title" data-reveal>
               {copy.title}
            </h1>
            <p data-reveal>{copy.body}</p>
            {step === "how" && (
               <div className="onboarding-examples" data-reveal>
                  <span>“Show my projects”</span>
                  <span>“Tell me about you”</span>
                  <span>“Go back”</span>
               </div>
            )}
            {step === "permission" && (
               <div className="privacy-note" data-reveal>
                  <span>◌</span>
                  <span>
                     MICROPHONE ACCESS IS ONLY REQUESTED AFTER YOU CONTINUE.
                  </span>
               </div>
            )}
            {step === "check" && (
               <div
                  className={`onboarding-listening ${voiceState === "LISTENING" ? "active" : ""}`}
                  data-reveal
               >
                  <span className="onboarding-pulse" />
                  {tutorialSuccess
                     ? "COMMAND RECOGNIZED / SHOWING PROJECTS"
                     : voiceState === "ERROR"
                       ? "TRY THAT AGAIN"
                       : voiceState === "LISTENING"
                         ? "LISTENING..."
                         : "PRESS LISTEN TO TRY"}
               </div>
            )}
            <div className="onboarding-actions" data-reveal>
               {step === "check" ? (
                  <>
                     {tutorialSuccess ? (
                        <button
                           className="button button-light"
                           onClick={completeOnboarding}
                        >
                           Enter MAVOS <span>↗</span>
                        </button>
                     ) : (
                        <button
                           className="button button-light"
                           onClick={() => {
                              setTutorialMode(true);
                              startListening();
                           }}
                        >
                           {isSupported ? "Listen" : "Use keyboard instead"}{" "}
                           <span>↗</span>
                        </button>
                     )}
                     <button className="text-button" onClick={skip}>
                        Skip tutorial
                     </button>
                  </>
               ) : (
                  <>
                     <button className="button button-light" onClick={next}>
                        {step === "permission"
                           ? isSupported
                              ? "Enable microphone"
                              : "Continue without voice"
                           : "Continue"}{" "}
                        <span>↗</span>
                     </button>
                     <button className="text-button" onClick={skip}>
                        Skip for now
                     </button>
                  </>
               )}
            </div>
         </div>
         <div className="onboarding-bottom">
            <span>LOCAL EXPERIENCE / NO RECORDINGS STORED</span>
            <span>
               {step === "check" && voiceState === "LISTENING"
                  ? "SPEAK CLEARLY"
                  : "MAVOS 2026"}
            </span>
         </div>
      </div>
   );
}
