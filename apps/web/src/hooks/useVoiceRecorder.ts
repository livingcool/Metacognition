'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * useVoiceRecorder — Cinematic Web Recording Hook
 * Handles MediaRecorder API orchestration and automatic transcription upload.
 */
export const useVoiceRecorder = (onTranscribe: (text: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(audioStream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        if (audioBlob.size > 1000) {
           await handleTranscription(audioBlob);
        }
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      // Auto-stop after 25 seconds
      timerRef.current = setTimeout(() => {
        console.log('[VoiceRecorder] Max duration reached, stopping...');
        stopRecording();
      }, 25000);

    } catch (err) {
      console.error('[VoiceRecorder] Failed to start recording:', err);
    }
  }, [stopRecording]);

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const response = await fetch(`${apiUrl}/api/voice/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      if (data.text) {
        onTranscribe(data.text);
      }
    } catch (err) {
      console.error('[VoiceRecorder] Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    stream,
    toggleRecording,
  };
};
