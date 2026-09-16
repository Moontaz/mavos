"use client";

import gsap from "gsap";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { useMavos } from "@/components/layout/MavosShell";

export function HomeHero() {
   const ref = useRef<HTMLElement>(null);
   const { startListening, openGuide } = useMavos();

   useLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;
      const context = gsap.context(() => {
         const lines = element.querySelectorAll("[data-hero-line]");
         gsap.fromTo(
            lines,
            { yPercent: 115, opacity: 0 },
            {
               yPercent: 0,
               opacity: 1,
               duration: 1,
               stagger: 0.09,
               delay: 0.2,
               ease: "power4.out",
            },
         );
         gsap.fromTo(
            "[data-hero-meta]",
            { opacity: 0 },
            {
               opacity: 1,
               duration: 0.7,
               delay: 0.85,
               stagger: 0.1,
               ease: "power2.out",
            },
         );
         gsap.fromTo(
            "[data-hero-mark]",
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1.1, delay: 0.75, ease: "power4.out" },
         );
      }, ref);
      return () => context.revert();
   }, []);

   return (
      <section className="home-hero" ref={ref}>
         <div className="hero-corner hero-corner-tl">© / 24</div>
         <div className="hero-corner hero-corner-tr">BROWSER / VOICE</div>
         <div className="hero-main">
            <div className="hero-prelude" data-hero-meta>
               <span className="signal-square" /> A WEB EXPERIENCE IN YOUR VOICE
            </div>
            <h1 aria-label="Mavos, your voice your interface">
               <span className="hero-line" data-hero-line>
                  <span>MAVOS</span>
               </span>
               <span className="hero-line hero-line-secondary" data-hero-line>
                  <em>YOUR VOICE.</em>
               </span>
               <span className="hero-line hero-line-secondary" data-hero-line>
                  <em>YOUR INTERFACE.</em>
               </span>
            </h1>
            <div className="hero-bottom">
               <p className="hero-description" data-hero-meta>
                  A web experience built around the way you speak.
                  <br />
                  Navigate, explore, and make it move.
               </p>
               <div className="hero-actions" data-hero-meta>
                  <button
                     className="button button-dark"
                     onClick={startListening}
                  >
                     Start experience <span>↗</span>
                  </button>
                  <Link className="text-button" href="/experience">
                     Enter quietly <span>↘</span>
                  </Link>
               </div>
            </div>
         </div>
         <div className="hero-rule" data-hero-mark />
         <div className="hero-meta-row">
            <span data-hero-meta>01 / 04 — HOME</span>
            <button data-hero-meta className="hero-help" onClick={openGuide}>
               [ ? ] WHAT CAN I SAY?
            </button>
            <span data-hero-meta>SCROLL TO EXPLORE ↓</span>
         </div>
      </section>
   );
}
