"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMavos } from "@/components/layout/MavosShell";
import { parseCommand } from "@/lib/voice/commandParser";
import type { VoiceCommand } from "@/lib/types";

const options = [
   "Show projects",
   "About me",
   "Open Saling Pandu",
   "Open Smile Detector",
   "Open MAVOS",
   "Go home",
   "Help",
];

export function CommandPalette() {
   const { paletteOpen, closePalette, executeCommand } = useMavos();
   const [query, setQuery] = useState("");
   const [selected, setSelected] = useState(0);
   const panelRef = useRef<HTMLDivElement>(null);
   const filtered = useMemo(
      () =>
         options.filter((option) =>
            option.toLowerCase().includes(query.toLowerCase()),
         ),
      [query],
   );

   useEffect(() => {
      if (!paletteOpen) return;
      setQuery("");
      setSelected(0);
      const onKey = (event: KeyboardEvent) => {
         if (event.key === "Escape") closePalette();
         if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelected((value) => Math.min(value + 1, filtered.length - 1));
         }
         if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelected((value) => Math.max(value - 1, 0));
         }
         if (event.key === "Enter") {
            event.preventDefault();
            if (filtered[selected]) run(filtered[selected]);
         }
      };
      window.addEventListener("keydown", onKey);
      requestAnimationFrame(() =>
         panelRef.current?.querySelector<HTMLInputElement>("input")?.focus(),
      );
      return () => window.removeEventListener("keydown", onKey);
      // filtered and selected are intentionally read by the key handler at open time; click handlers cover current results.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [paletteOpen, closePalette]);

   const run = (label: string) => {
      const parsed = parseCommand(label);
      if (parsed) executeCommand(parsed as VoiceCommand);
      closePalette();
   };

   if (!paletteOpen) return null;
   return (
      <div
         className="overlay-backdrop palette-backdrop"
         role="presentation"
         onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePalette();
         }}
      >
         <section
            className="palette-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="palette-title"
         >
            <div className="palette-search">
               <span>⌕</span>
               <input
                  id="palette-title"
                  value={query}
                  onChange={(event) => {
                     setQuery(event.target.value);
                     setSelected(0);
                  }}
                  placeholder="Search commands..."
                  aria-label="Search commands"
               />
               <kbd>ESC</kbd>
            </div>
            <div className="palette-results">
               {filtered.map((option, index) => (
                  <button
                     className={index === selected ? "selected" : ""}
                     key={option}
                     onMouseEnter={() => setSelected(index)}
                     onClick={() => run(option)}
                  >
                     <span>→</span>
                     {option}
                     <small>↵</small>
                  </button>
               ))}
               {!filtered.length && (
                  <p className="empty-result">
                     No command found. Try “projects” or “help”.
                  </p>
               )}
            </div>
            <div className="palette-hint">
               <span>↑↓ NAVIGATE</span>
               <span>ENTER SELECT</span>
               <span>VOICE / KEYBOARD</span>
            </div>
         </section>
      </div>
   );
}
