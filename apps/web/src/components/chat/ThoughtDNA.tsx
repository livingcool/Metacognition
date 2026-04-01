'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * ThoughtDNA — 5 Animated Cognitive Bias Bars (Task 2.2)
 * Staggered animation on mount, JetBrains Mono labels.
 */

interface DNAScores {
  assumptionLoad: number;
  emotionalSignal: number;
  evidenceCited: number;
  alternativesConsidered: number;
  uncertaintyTolerance: number;
}

interface ThoughtDNAProps {
  scores: DNAScores;
}

const formatLabel = (label: string) => {
  return label.replace(/([A-Z])/g, ' $1').toUpperCase();
};

export const ThoughtDNA = ({ scores }: ThoughtDNAProps) => {
  const scorePairs = Object.entries(scores);

  return (
    <div className="space-y-4 my-8">
      <div className="flex justify-between items-end mb-6">
        <h4 className="text-[10px] font-mono text-cyan-200/40 uppercase tracking-[0.4em]">
          Cognitive DNA Analysis
        </h4>
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
          {Object.values(scores).reduce((a, b) => a + b, 0) / 5}% Aggregate
        </span>
      </div>

      {scorePairs.map(([key, value], index) => (
        <div key={key} className="group cursor-default">
          <div className="flex justify-between mb-1.5 px-1">
            <span className="text-[10px] font-mono text-cyan-100/60 uppercase tracking-widest group-hover:text-cyan-100 transition-colors">
              {formatLabel(key)}
            </span>
            <span className="text-[10px] font-mono text-cyan-200/40 group-hover:text-cyan-200 transition-colors">
              {value}%
            </span>
          </div>
          
          <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ delay: 0.5 + index * 0.1, duration: 2.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full bg-gradient-to-r from-cyan-900 via-cyan-500 to-teal-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
