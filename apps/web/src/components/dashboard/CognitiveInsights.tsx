'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Logo } from '../Logo';

interface InsightProps {
  profile: any;
  aggregates: {
    avgGap: number;
    failureRate: number;
  };
}

export const CognitiveInsights = ({ profile, aggregates }: InsightProps) => {
  const dominantBias = profile.dominant_patterns?.[0] || 'Unknown';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-3xl relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-12">
        <div>
          <h3 className="font-mono text-[10px] text-violet-400 uppercase tracking-[0.8em] mb-2 font-bold">Ambient Pattern Intelligence</h3>
          <p className="font-serif italic text-white/40 text-xs">The Mirror sees you more clearly than you see yourself.</p>
        </div>
        <Logo size={32} className="text-violet-500/30 group-hover:text-violet-400 group-hover:rotate-45 transition-all duration-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Dominant Pattern */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
               <TrendingUp size={16} />
             </div>
             <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Dominant Bias Detected</span>
          </div>
          <h4 className="text-2xl font-serif text-white">{dominantBias}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your recent sessions show a heavy weighting toward {dominantBias}. This often occurs when multiple decisions are made under high uncertainty.
          </p>
        </div>

        {/* Calibration Insight */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
               <TrendingDown size={16} />
             </div>
             <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Truth Accuracy Gap</span>
          </div>
          <h4 className="text-2xl font-serif text-white">{aggregates.avgGap} Points</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your calibration error is currently {aggregates.avgGap > 30 ? 'high' : 'stable'}. You are {aggregates.avgGap > 50 ? 'strongly overconfident' : 'relatively accurate'} about your predictions.
          </p>
        </div>
      </div>

      {/* Meta Message */}
      <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
         <Logo size={10} className="text-indigo-400 opacity-50" />
         <span>Pattern stability: 72% // Last update: {new Date().toLocaleDateString()}</span>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-600/5 blur-[80px] rounded-full" />
    </motion.div>
  );
};
