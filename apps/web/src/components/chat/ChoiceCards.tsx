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
  description?: string;
}

interface ChoiceCardsProps {
  choices: Choice[];
  onChoiceSelect: (choice: Choice) => void;
  isDisabled?: boolean;
}

export const ChoiceCards = ({ 
  choices = [], 
  onChoiceSelect, 
  isDisabled 
}: ChoiceCardsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-8 mt-12 w-full max-w-7xl px-4 lg:px-24">
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
          onClick={() => !isDisabled && onChoiceSelect(choice)}
          disabled={isDisabled}
          className="group relative p-8 lg:p-12 min-w-[320px] lg:flex-1 prism-glass prism-edge rounded-[3rem] text-left transition-all prism-glass-hover active:scale-[0.98] disabled:opacity-30 cursor-pointer shadow-2xl border-white/5 hover:border-violet-500/40 flex flex-col justify-between h-auto min-h-[220px]"
        >
          {/* Subtle Dynamic Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[3rem]" />
          
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-mono text-violet-400 group-hover:text-violet-300 transition-colors uppercase tracking-[0.5em]">Gate {index + 1}</span>
               <div className="h-[1px] flex-grow bg-white/5 group-hover:bg-violet-500/20 transition-all" />
            </div>
            
            <span className="text-2xl lg:text-3xl font-serif italic text-slate-100 group-hover:text-white transition-colors tracking-tight leading-tight block">
              {choice.text}
            </span>

            {choice.description && (
               <p className="text-xs lg:text-sm font-serif italic text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed opacity-80 group-hover:opacity-100">
                 {choice.description}
               </p>
            )}
          </div>

          <div className="relative z-10 mt-6 flex justify-end">
             <motion.div 
               whileHover={{ x: 5 }}
               className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-violet-500/40 transition-all bg-black/20"
             >
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full group-hover:bg-violet-400 animate-pulse" />
             </motion.div>
          </div>

          <div className="absolute inset-0 border border-white/0 group-hover:border-violet-500/20 rounded-[3rem] transition-colors duration-700" />
        </motion.button>
      ))}
    </div>
  );
};
