'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { useMavos } from '@/components/layout/MavosShell';

export function VoiceExperience() {
  const { voiceState, transcript, interimTranscript, command, isListening, toggleVoice, openGuide, isSupported, errorMessage } = useMavos();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    gsap.fromTo(headingRef.current, { clipPath: 'inset(100% 0 0 0)', y: 20 }, { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.9, ease: 'power4.out' });
  }, []);

  const text = interimTranscript || transcript;
  const status = !isSupported ? 'VOICE INPUT UNAVAILABLE' : voiceState === 'LISTENING' ? 'LISTENING' : voiceState === 'COMMAND_RECOGNIZED' ? 'COMMAND RECOGNIZED' : voiceState === 'PROCESSING' ? 'PROCESSING' : voiceState === 'SUCCESS' ? 'COMPLETE' : 'READY';
  return (
    <section className="experience-page page-frame">
      <div className="section-kicker"><span>02 / 04</span><span>PRIMARY INTERFACE</span></div>
      <div className="experience-intro"><p className="eyebrow">MAVOS / VOICE EXPERIENCE</p><h1 ref={headingRef}>Say what<br /><em>you mean.</em></h1><p className="lede">A navigation layer that responds to natural language. No command syntax. No assistant persona. Just your voice, translated into movement.</p></div>
      <div className={`experience-console ${isListening ? 'is-listening' : ''}`}>
        <div className="console-status"><span className={isListening ? 'status-pulse' : ''}>{status}</span><span>{isListening ? 'MICROPHONE ACTIVE' : 'BROWSER INPUT'}</span></div>
        <div className="experience-wave"><div className="wave-line wave-line-a" /><div className="wave-line wave-line-b" /><div className="wave-line wave-line-c" /><div className="wave-markers"><i /><i /><i /><i /><i /><i /><i /></div></div>
        <div className="console-response"><span className="eyebrow">{command ? command.label : 'YOUR TRANSCRIPT'}</span><p>{text ? `“${text}”` : '“show my projects”'}</p>{errorMessage && <small>{errorMessage}</small>}</div>
        <button className="experience-listen" onClick={toggleVoice}><span className={isListening ? 'stop-icon' : 'play-icon'} />{isListening ? 'Stop listening' : 'Start listening'}<span className="shortcut">SPACE</span></button>
      </div>
      <div className="experience-footer"><button className="text-button" onClick={openGuide}>What can I say? <span>↗</span></button><span>{isSupported ? 'SPEECH RECOGNITION READY' : 'KEYBOARD FALLBACK ACTIVE'}</span></div>
    </section>
  );
}
