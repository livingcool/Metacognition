import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { ArrowRight, Activity, Zap, Heart, RefreshCw, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onStart: (mode: string) => void;
  isInitializing: boolean;
}

const MODES = [
  { id: 'logos', name: 'Logos', desc: 'Logical Audit', icon: Zap, color: 'text-blue-400' },
  { id: 'pathos', name: 'Pathos', desc: 'Emotional Signal', icon: Heart, color: 'text-rose-400' },
  { id: 'metanoia', name: 'Metanoia', desc: 'Perspective Shift', icon: RefreshCw, color: 'text-emerald-400' },
  { id: 'mythos', name: 'Mythos', desc: 'Narrative Archetype', icon: Sparkles, color: 'text-violet-400' },
];

/**
 * HeroSection — The Cinematic Entry
 * High-craft minimalist hero with the Neural Fold logo.
 */
export const HeroSection = ({ onStart, isInitializing }: HeroSectionProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
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
          {isSelecting ? 'Choose your entry' : 'The internal lens'}<br/>
          <span className="text-slate-500/50 not-italic font-mono text-3xl md:text-5xl tracking-[0.2em] relative top-[-0.2em]">
            {isSelecting ? 'cognitive focal point.' : 'is ready.'}
          </span>
        </h1>
        {!isSelecting && (
          <p className="font-mono text-[10px] md:text-[12px] uppercase tracking-[0.6em] text-slate-500 max-w-2xl mx-auto leading-relaxed mt-4">
            Witness the patterns of your own mind. <br className="hidden md:block"/>
            Initiate a new cycle of metacognitive awareness.
          </p>
        )}
      </motion.div>

      {/* 3. Primary CTA Block */}
      <div className="mt-20 flex flex-col items-center gap-8 min-h-[200px]">
        <AnimatePresence mode="wait">
          {!isSelecting ? (
            <motion.div
              key="init-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
            >
              <button 
                onClick={() => setIsSelecting(true)}
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
            </motion.div>
          ) : (
            <motion.div
              key="selection-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, staggerChildren: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl w-full px-4"
            >
              {MODES.map((mode, i) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onStart(mode.id)}
                  disabled={isInitializing}
                  className="group relative flex flex-col items-center gap-4 p-8 prism-glass rounded-3xl border border-white/5 hover:border-white/20 transition-all hover:translate-y-[-8px] active:scale-95 shadow-2xl"
                >
                  <div className={`p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors ${mode.color}`}>
                    <mode.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-serif italic text-lg text-white">{mode.name}</span>
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-500">{mode.desc}</span>
                  </div>
                  
                  {/* Hover Accent */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!isSelecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 opacity-40"
          >
             <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
             <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-slate-400">Cognitive Link: Active</span>
          </motion.div>
        )}
      </div>

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
