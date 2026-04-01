'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideSend, LucideMic, LucideLoader2 } from 'lucide-react';

/**
 * InputField — The Aural Slice (V4.0)
 * Ultra-minimalist, edge-to-edge transparent slice.
 * Breaths and expands slightly with voice amplitude.
 */

interface InputFieldProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  isDisabled?: boolean;
  voiceState: {
    isRecording: boolean;
    isTranscribing: boolean;
    toggleRecording: () => void;
  };
  amplitude?: number; // Optional fallback if not passed by parent
}

export const InputField = ({ value, onChange, onSend, isDisabled, voiceState, amplitude = 0 }: InputFieldProps) => {
  const { isRecording, isTranscribing, toggleRecording } = voiceState;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (value.trim() && !isDisabled && !isTranscribing) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Map 0-1 amplitude to 0-30px padding for breathing effect, and opacity for glow.
  const expandPadding = isRecording ? amplitude * 30 : 0;
  const glowOpacity = isRecording ? (0.2 + amplitude * 0.8) : 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative group w-full flex justify-center"
    >
      {/* Dynamic Voice Glow (The Aural Breathing) */}
      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: glowOpacity, scale: 1 + amplitude * 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-10 bg-violet-600/30 blur-[60px] rounded-[100px] pointer-events-none"
            transition={{ type: "spring", bounce: 0, duration: 0.1 }}
          />
        )}
      </AnimatePresence>
      
      {/* Minimalist Aural Slice Container */}
      <motion.div 
        animate={{
          paddingTop: 16 + expandPadding,
          paddingBottom: 16 + expandPadding,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.1 }}
        className={`relative flex items-end gap-4 w-full px-8 backdrop-blur-md rounded-3xl transition-all duration-700 ease-out border-t border-white/5 bg-gradient-to-t from-black/60 to-transparent shadow-[0_-20px_40px_rgba(0,0,0,0.4)] ${isRecording ? 'border-violet-500/30' : 'group-hover:border-white/20'}`}
      >
        
        {/* The Microphone (Neural Link Toggle) */}
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); toggleRecording(); }}
          disabled={isTranscribing}
          className={`p-4 rounded-full transition-all relative z-10 flex-shrink-0 flex items-center justify-center
            ${isRecording 
              ? 'text-white' 
              : 'text-slate-500 hover:text-white'}
          `}
        >
          {isTranscribing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <LucideLoader2 size={24} className="text-violet-400" />
            </motion.div>
          ) : (
            <motion.div
              animate={isRecording ? { scale: [1, 1.2, 1], filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.8))' } : { scale: 1, filter: 'none' }}
              transition={{ repeat: isRecording ? Infinity : 0, duration: 1.5 }}
            >
              <LucideMic size={24} className={isRecording ? "text-violet-300" : ""} />
            </motion.div>
          )}

          {/* Core Recording Indicator */}
          {isRecording && (
            <motion.div 
              className="absolute inset-0 rounded-full border border-violet-500"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </button>

        {/* Deep Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || isTranscribing}
          placeholder={isTranscribing ? "Synthesizing voice into thought..." : "Type or speak your thoughts..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 font-serif text-xl md:text-2xl tracking-wide py-4 max-h-64 resize-none overflow-y-auto placeholder:text-slate-600 placeholder:italic placeholder:font-light"
          rows={1}
        />

        {/* Vapor Send Button */}
        <AnimatePresence mode="wait">
          {(value.trim() || isTranscribing) && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
              onClick={(e) => { e.preventDefault(); handleSend(); }}
              disabled={isDisabled || isTranscribing || !value.trim()}
              className="p-4 flex-shrink-0 text-white hover:text-violet-300 transition-colors disabled:opacity-20 flex items-center justify-center active:scale-90"
            >
              <LucideSend size={24} />
            </motion.button>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Floating Meta Labels */}
      <div className="absolute -top-8 w-full flex justify-between px-10 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
         <span className="text-[9px] font-mono text-violet-400 tracking-[0.4em] uppercase">
           {isRecording ? "Capturing Frequency (Max 25s)..." : isTranscribing ? "Transcribing Pattern..." : "Aural Link Ready"}
         </span>
         {value.length > 0 && (
           <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
             {value.length} Data nodes
           </span>
         )}
      </div>

    </motion.div>
  );
};
