import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { ArrowRight, Activity, Zap, Heart, RefreshCw, Sparkles, Binary, Cpu, Layers, MessageSquare } from 'lucide-react';
import { Magnetic } from './Magnetic';

interface HeroSectionProps {
  onStart: (mode: string) => void;
  isInitializing: boolean;
}

const MODES = [
  { id: 'calibration', name: 'Calibration Engine', desc: 'Neural Sync', icon: Cpu, color: 'text-blue-400' },
  { id: 'reality', name: 'Reality Layer', desc: 'Tension Engine', icon: Layers, color: 'text-rose-400' },
  { id: 'patterns', name: 'Ambient Surfaces', desc: 'Pattern Detection', icon: Activity, color: 'text-emerald-400' },
  { id: 'chat', name: 'Neural Chat', desc: 'Direct Protocol', icon: MessageSquare, color: 'text-violet-400' },
];

/**
 * HeroSection — The Cinematic Entry [High Craft]
 */
export const HeroSection = ({ onStart, isInitializing }: HeroSectionProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  
  return (
    <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-20 px-8 text-center bg-transparent overflow-hidden">
      
      {/* 1. Context HUD Labels (Corner Anchored) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-32 left-12 flex flex-col gap-1 items-start">
          <span className="text-hud">MODE_ALPHA: SYNCED</span>
          <div className="w-12 h-px bg-white/10" />
        </div>
        <div className="absolute top-32 right-12 flex flex-col gap-1 items-end">
          <span className="text-hud">NEURAL_FOLD: ACTIVE</span>
          <div className="w-12 h-px bg-white/10" />
        </div>
      </div>

      {/* 2. Logo Focus (Optical Center Offset) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 relative -top-12 md:-top-20"
      >
        <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full scale-150" />
        <Logo size={140} className="relative z-10 text-white/90" />
      </motion.div>

      {/* 3. Cinematic Typography [Outfit/Playfair Mix] */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8 max-w-5xl relative z-10"
      >
        <h1 className="text-7xl md:text-[10rem] italic text-slate-100 font-serif leading-[0.85] tracking-tighter">
          {isSelecting ? 'Choose entry' : 'The internal lens'}<br/>
          <span className="text-slate-500/40 not-italic font-mono text-2xl md:text-5xl tracking-[0.25em] relative top-[-0.25em] uppercase">
             {isSelecting ? 'cognitive focal point.' : 'is calibration ready.'}
          </span>
        </h1>
        
        {!isSelecting && (
          <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.7em] text-slate-600 max-w-2xl mx-auto leading-[2] mt-6">
            Witness the recursive patterns of your own mind. <br className="hidden md:block"/>
            Initiate a high-resolution cycle of awareness.
          </p>
        )}
      </motion.div>

      {/* 4. Primary CTA Block [Magnetic Physics] */}
      <div className="mt-24 flex flex-col items-center gap-12 min-h-[220px]">
        <AnimatePresence mode="wait">
          {!isSelecting ? (
            <motion.div
              key="init-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
            >
              <Magnetic strength={0.3}>
                <button 
                  onClick={() => setIsSelecting(true)}
                  disabled={isInitializing}
                  className="group relative px-20 py-8 prism-glass prism-glass-hover prism-edge rounded-full overflow-hidden transition-all disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-emerald-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_auto] animate-gradient-x" />
                  <div className="relative z-10 flex items-center gap-8">
                    <span className="font-mono text-xs uppercase tracking-[0.8em] text-slate-100">
                      {isInitializing ? 'Calibrating...' : 'Initiate Protocol'}
                    </span>
                    <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-3 transition-transform duration-500" />
                  </div>
                </button>
              </Magnetic>
            </motion.div>
          ) : (
            <motion.div
              key="selection-grid"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, staggerChildren: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl w-full px-4"
            >
              {MODES.map((mode, i) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onStart(mode.id)}
                  disabled={isInitializing}
                  className="group relative flex flex-col items-center gap-6 p-10 prism-glass prism-glass-hover rounded-[2rem] border border-white/5 transition-all active:scale-95 shadow-2xl"
                >
                  <div className={`p-5 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors ${mode.color}`}>
                    <mode.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="block font-serif italic text-2xl text-white">{mode.name}</span>
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-500">{mode.desc}</span>
                  </div>
                  {/* Hover Accent */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!isSelecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-6 opacity-30 mt-8"
          >
             <div className="flex items-center gap-3">
               <Cpu className="w-3 h-3 text-violet-500 opacity-60" />
               <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-slate-400">Memory: 100% READY</span>
             </div>
             <div className="w-px h-3 bg-white/10" />
             <div className="flex items-center gap-3">
               <Binary className="w-3 h-3 text-emerald-500 opacity-60" />
               <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-slate-400">Engine: SYNCED</span>
             </div>
          </motion.div>
        )}
      </div>

      {/* 5. Scroll Indicator [Precision Placement] */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 2 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
      >
        <span className="font-mono text-[9px] uppercase tracking-[1em] text-slate-700 ml-[1em]">Scry Further</span>
        <div className="w-px h-20 bg-gradient-to-b from-slate-800 via-slate-900 to-transparent" />
      </motion.div>

    </section>
  );
};
