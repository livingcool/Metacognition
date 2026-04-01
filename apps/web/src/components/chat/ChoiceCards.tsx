'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * ChoiceCards — 2x2 Selection Grid (Task 2.2)
 * Features: Liquid fill on hover, glass styling, selection animations.
 */

interface Choice {
  id: string;
  text: string;
}

interface ChoiceCardsProps {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
  isDisabled?: boolean;
}

export const ChoiceCards = ({ 
  choices, 
  onSelect, 
  isDisabled 
}: ChoiceCardsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-12 w-full max-w-5xl px-12">
      {choices.map((choice, index) => (
        <motion.button
          key={choice.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.1 * index,
            ease: [0.16, 1, 0.3, 1]
          }}
          onClick={() => !isDisabled && onSelect(choice)}
          disabled={isDisabled}
          className="group relative p-10 min-w-[300px] prism-glass prism-edge rounded-[2.5rem] text-center transition-all prism-glass-hover active:scale-[0.98] disabled:opacity-30 cursor-pointer shadow-2xl border-white/5 hover:border-violet-500/40"
        >
          {/* Subtle Dynamic Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2.5rem]" />
          
          <div className="relative z-10 space-y-4">
            <span className="text-xl font-serif italic text-slate-100 group-hover:text-white transition-colors tracking-wide leading-relaxed block">
              "{choice.text}"
            </span>
            <div className="flex items-center justify-center gap-3">
               <div className="w-8 h-[1px] bg-violet-500/30" />
               <span className="text-[9px] font-mono text-violet-400/60 uppercase tracking-[0.4em]">Choice {index + 1}</span>
               <div className="w-8 h-[1px] bg-violet-500/30" />
            </div>
          </div>

          <div className="absolute inset-0 border border-white/0 group-hover:border-violet-500/20 rounded-[2.5rem] transition-colors duration-700" />
        </motion.button>
      ))}
    </div>
  );
};
