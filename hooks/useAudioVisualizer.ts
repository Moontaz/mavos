"use client";

import { RefObject, useEffect, useRef } from "react";

export function useAudioVisualizer(
   canvasRef: RefObject<HTMLCanvasElement>,
   active: boolean,
) {
   const streamRef = useRef<MediaStream | null>(null);
   const frameRef = useRef<number | null>(null);
   const contextRef = useRef<AudioContext | null>(null);

   useEffect(() => {
      let disposed = false;

      const stop = () => {
         if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
         frameRef.current = null;
         streamRef.current?.getTracks().forEach((track) => track.stop());
         streamRef.current = null;
         if (contextRef.current && contextRef.current.state !== "closed")
            void contextRef.current.close();
         contextRef.current = null;
      };

      if (
         !active ||
         !canvasRef.current ||
         !navigator.mediaDevices?.getUserMedia
      ) {
         stop();
         return stop;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return stop;

      const resize = () => {
         const ratio = Math.min(window.devicePixelRatio || 1, 2);
         canvas.width = canvas.clientWidth * ratio;
         canvas.height = canvas.clientHeight * ratio;
         context.setTransform(ratio, 0, 0, ratio, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);

      const render = (analyser: AnalyserNode) => {
         const width = canvas.clientWidth;
         const height = canvas.clientHeight;
         const data = new Uint8Array(analyser.fftSize);
         const draw = () => {
            if (disposed) return;
            analyser.getByteTimeDomainData(data);
            context.clearRect(0, 0, width, height);
            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = "rgba(255,255,255,0.92)";
            for (let x = 0; x < width; x += 2) {
               const sample =
                  data[Math.floor((x / width) * data.length)] / 128 - 1;
               const distance = Math.max(0, Math.abs(sample) * height * 1.35);
               const y =
                  height / 2 +
                  Math.sin(x * 0.025) * distance * 0.08 +
                  sample * distance;
               if (x === 0) context.moveTo(x, y);
               else context.lineTo(x, y);
            }
            context.stroke();
            frameRef.current = requestAnimationFrame(draw);
         };
         draw();
      };

      void navigator.mediaDevices
         .getUserMedia({ audio: true })
         .then((stream) => {
            if (disposed) {
               stream.getTracks().forEach((track) => track.stop());
               return;
            }
            streamRef.current = stream;
            const AudioContextClass =
               window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const audioContext = new AudioContextClass();
            contextRef.current = audioContext;
            // Browsers may create the context suspended until a gesture; resume so the waveform reflects input.
            if (audioContext.state === "suspended")
               void audioContext.resume().catch(() => undefined);
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.78;
            source.connect(analyser);
            render(analyser);
         })
         .catch(() => {
            // Speech recognition can still work when visual microphone access is unavailable.
         });

      return () => {
         disposed = true;
         window.removeEventListener("resize", resize);
         stop();
      };
   }, [active, canvasRef]);
}

declare global {
   interface Window {
      webkitAudioContext?: typeof AudioContext;
   }
}
