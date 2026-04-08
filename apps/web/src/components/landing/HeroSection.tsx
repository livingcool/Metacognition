'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { ArrowRight, Activity } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
  isInitializing: boolean;
}

/**
 * HeroSection — The Cinematic Entry
 * High-craft minimalist hero with the Neural Fold logo.
 */
export const HeroSection = ({ onStart, isInitializing }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-8 text-center bg-transparent overflow-hidden">
      
      {/* 1. Logo Focus */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-violet-500/20 blur-[100px] rounded-full" />
        <Logo size={120} className="relative z-10 text-violet-400/80" />
      </motion.div>

      {/* 2. Cinematic Typography */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6 max-w-4xl"
      >
        <h1 className="text-6xl md:text-9xl italic text-slate-100 font-serif leading-[0.9] tracking-tighter">
          The internal lens<br/>
          <span className="text-slate-500/50 not-italic font-mono text-3xl md:text-5xl tracking-[0.2em] relative top-[-0.2em]">is ready.</span>
        </h1>
        <p className="font-mono text-[10px] md:text-[12px] uppercase tracking-[0.6em] text-slate-500 max-w-2xl mx-auto leading-relaxed mt-4">
          Witness the patterns of your own mind. <br className="hidden md:block"/>
          Initiate a new cycle of metacognitive awareness.
        </p>
      </motion.div>

      {/* 3. Primary CTA Block */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-20 flex flex-col items-center gap-8"
      >
        <button 
          onClick={onStart}
          disabled={isInitializing}
          className="group relative px-14 py-7 prism-glass prism-edge rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-emerald-600/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center gap-6">
            <span className="font-mono text-xs uppercase tracking-[0.6em] text-slate-100">
              {isInitializing ? 'Calibrating Link...' : 'Initiate Protocol'}
            </span>
            <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-2 transition-transform" />
          </div>
        </button>

        <div className="flex items-center gap-4 opacity-40">
           <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
           <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-slate-400">Cognitive Link: Active</span>
        </div>
      </motion.div>

      {/* 4. Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.8em] text-slate-700">Scroll to Decipher</span>
        <div className="w-px h-12 bg-gradient-to-b from-slate-800 to-transparent" />
      </motion.div>

    </section>
  );
};
