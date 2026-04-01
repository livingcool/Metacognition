'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThoughtDNA } from './ThoughtDNA';
import { LucideQuote, LucideBinary } from 'lucide-react';

/**
 * MirrorResponse — The Cinematic Reflection Glass Card (Task 2.2)
 * Features aurora-wipe animations, PatternDetected banners, and Citations.
 */

interface MirrorResponseProps {
  content: {
    patternDetected?: {
      name: string;
      citation: string;
      description: string;
    };
    dnaScores?: {
      curiosity: number;
      analyticalDepth: number;
      skepticism: number;
      reflectiveTendency: number;
      openness: number;
      decisiveness: number;
      assumptionLoad: number;
      emotionalSignal: number;
    };
    reflection: string;
    question: string;
    choices?: { id: string; text: string }[];
  }[];
  isStreaming?: boolean;
}

export const MirrorResponse = ({ 
  content, 
  isStreaming 
}: MirrorResponseProps) => {
  return (
    <div className="w-full max-w-3xl space-y-12 pb-48 px-4">
      <AnimatePresence mode="popLayout">
        {content.map((turn, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Pattern Detected Banner (Task 2.2) */}
            {turn.patternDetected && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -left-4 top-0 -translate-x-full pr-12 hidden lg:block"
              >
                <div className="w-64 p-4 bg-white/5 backdrop-blur-xl border-l border-cyan-500 shadow-2xl rounded-sm">
                  <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-1.5 block">
                    Pattern Identified
                  </span>
                  <h4 className="text-sm font-serif italic text-white mb-2 leading-tight">
                    {turn.patternDetected.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Source: {turn.patternDetected.citation}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Main Glass Card */}
            <div className="group relative p-8 bg-black/30 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              {/* Aurora Sweep Overlay */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
              
              <div className="relative z-10 space-y-6">
                <LucideQuote size={20} className="text-cyan-500/20" />
                
                <p className="text-xl font-serif leading-relaxed text-slate-100 italic">
                   {turn.reflection}
                </p>

                {turn.question && (
                  <p className="text-lg font-sans text-cyan-200/80 font-light border-l-2 border-cyan-500/20 pl-6 py-2">
                    {turn.question}
                  </p>
                )}

                {turn.dnaScores && (
                    <ThoughtDNA scores={turn.dnaScores} />
                )}

                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                   <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      <LucideBinary size={10} />
                      Entropy Resolution: 0.92
                   </div>
                   <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                     Session Memory Layer 1
                   </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isStreaming && (
         <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.4em]"
            >
              Metacognitive Processing
            </motion.span>
            <div className="flex gap-1.5">
               {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  />
               ))}
            </div>
         </div>
      )}
    </div>
  );
};
