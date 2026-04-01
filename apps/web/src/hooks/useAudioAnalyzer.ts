import { useEffect, useRef, useState } from 'react';

/**
 * useAudioAnalyzer — Cinematic Frequency Analysis Hook
 * Provides real-time amplitude and frequency data for 3D reactivity.
 */
export const useAudioAnalyzer = (stream: MediaStream | null) => {
  const [amplitude, setAmplitude] = useState(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!stream) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();

    analyzer.fftSize = 256;
    source.connect(analyzer);

    analyzerRef.current = analyzer;
    const bufferLength = analyzer.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const update = () => {
      if (!analyzerRef.current || !dataArrayRef.current) return;

      // Fix: Use any-cast to bypass strict buffer type check in TS 5.x/Next.js environment
      (analyzerRef.current as any).getByteFrequencyData(dataArrayRef.current);

      // Calculate average amplitude (0 to 1)
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / dataArrayRef.current.length / 255;
      
      setAmplitude(average);
      animationFrameRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      source.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return { amplitude };
};
