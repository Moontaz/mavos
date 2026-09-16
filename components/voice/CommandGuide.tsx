'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { commandExamples } from '@/lib/voice/commandParser';
import { useMavos } from '@/components/layout/MavosShell';

export function CommandGuide() {
  const { guideOpen, closeGuide } = useMavos();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guideOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeGuide(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus());
    return () => window.removeEventListener('keydown', onKey);
  }, [guideOpen, closeGuide]);

  useEffect(() => {
    if (!panelRef.current) return;
    if (guideOpen) gsap.fromTo(panelRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, [guideOpen]);

  if (!guideOpen) return null;
  return (
    <div className="overlay-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeGuide(); }}>
      <section className="guide-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <div className="panel-heading"><div><span className="eyebrow">MAVOS / COMMAND INDEX</span><h2 id="guide-title">What can I say?</h2></div><button className="close-button" onClick={closeGuide} aria-label="Close command guide">×</button></div>
        <p className="panel-intro">Speak naturally. MAVOS maps your words to a small set of useful actions.</p>
        <div className="command-groups">
          {commandExamples.map((group) => <div className="command-group" key={group.category}><span className="eyebrow">{group.category}</span><ul>{group.items.map((item) => <li key={item}><span className="command-arrow">↳</span>{item}</li>)}</ul></div>)}
        </div>
        <div className="panel-footer"><span>ESC TO CLOSE</span><span>SPACE TO LISTEN</span><span>⌘ / CTRL K COMMAND PALETTE</span></div>
      </section>
    </div>
  );
}
