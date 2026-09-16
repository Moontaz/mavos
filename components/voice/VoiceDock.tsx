'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import { useMavos } from '@/components/layout/MavosShell';

const stateLabels: Record<string, string> = {
  IDLE: 'READY WHEN YOU ARE',
  INITIALIZING: 'INITIALIZING MICROPHONE',
  READY: 'READY TO LISTEN',
  LISTENING: 'LISTENING',
  TRANSCRIBING: 'TRANSCRIBING',
  PROCESSING: 'PROCESSING',
  COMMAND_RECOGNIZED: 'COMMAND RECOGNIZED',
  EXECUTING: 'EXECUTING',
  SUCCESS: 'DONE',
  ERROR: 'INPUT NOT RECOGNIZED',
  UNSUPPORTED: 'VOICE INPUT UNAVAILABLE',
};

export function VoiceDock() {
  const { voiceOpen, voiceState, isListening, transcript, interimTranscript, command, errorMessage, toggleVoice, stopListening, openGuide, isSupported, history } = useMavos();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useAudioVisualizer(canvasRef, isListening);

  useEffect(() => {
    if (!voiceOpen || !panelRef.current) return;
    gsap.fromTo(panelRef.current, { y: 22, opacity: 0, clipPath: 'inset(100% 0 0 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power4.out' });
  }, [voiceOpen]);

  if (!voiceOpen) return null;

  const displayTranscript = interimTranscript || transcript;
  const isFeedback = ['COMMAND_RECOGNIZED', 'EXECUTING', 'SUCCESS', 'ERROR', 'UNSUPPORTED'].includes(voiceState);

  return (
    <aside className="voice-dock" ref={panelRef} aria-live="polite">
      <div className="voice-dock-topline"><span>VOICE INTERFACE / 01</span><span className={isListening ? 'status-pulse' : ''}>{stateLabels[voiceState]}</span></div>
      <div className="voice-dock-main">
        <div className="voice-signal-wrap">
          <canvas ref={canvasRef} className="voice-signal" aria-label="Realtime microphone waveform" />
          <div className="voice-signal-axis" />
        </div>
        <div className="voice-transcript">
          <span className="eyebrow">{isFeedback ? stateLabels[voiceState] : 'SAY SOMETHING'}</span>
          {command && voiceState !== 'ERROR' ? <strong>{command.label}</strong> : <p>{displayTranscript ? `“${displayTranscript}”` : '“show my projects”'}</p>}
          {errorMessage && <small>{errorMessage}</small>}
          {!isSupported && <small>Use keyboard or pointer controls to continue exploring MAVOS.</small>}
        </div>
        <button className="voice-stop" onClick={toggleVoice} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
          <span className={isListening ? 'stop-icon' : 'play-icon'} />{isListening ? 'Stop' : 'Listen'}
        </button>
      </div>
      <div className="voice-dock-footer">
        <button onClick={openGuide}>What can I say?</button>
        <span>{history.length ? `${history.length.toString().padStart(2, '0')} COMMANDS RECENTLY` : 'SPACE TO LISTEN'}</span>
        {isListening && <button onClick={stopListening}>Cancel</button>}
      </div>
    </aside>
  );
}
