'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Decision } from '@mirror/types';
import { Calendar, ChevronDown, CheckCircle, Clock } from 'lucide-react';

interface Zone3Props {
  decisions: Decision[];
  aggregates: {
    avgGap: number;
    failureRate: number;
  };
}

export const Zone3History = ({ decisions, aggregates }: Zone3Props) => {
  return (
    <div className="w-full flex flex-col xl:flex-row gap-12 py-12 px-12 pb-24 border-b border-white/5 bg-transparent min-h-[500px]">
      
      {/* 1. Left: Archaeology Stats */}
      <div className="w-full xl:w-1/4 flex flex-col gap-6">
        <h3 className="font-mono text-[10px] text-violet-400 uppercase tracking-[0.8em] mb-8">Archaeology Summary</h3>
        <div className="flex flex-col gap-4">
           <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-sm">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">Avg Confidence Gap</span>
              <div className="flex items-baseline gap-2 mt-2">
                 <span className="text-4xl font-serif italic text-white">{aggregates.avgGap}</span>
                 <span className="text-xs text-slate-400">pts</span>
              </div>
           </div>
           <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-sm">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">Assumption Failure Rate</span>
              <div className="flex items-baseline gap-2 mt-2">
                 <span className="text-4xl font-serif italic text-white">{aggregates.failureRate}%</span>
              </div>
           </div>
        </div>
        <p className="mt-8 text-[9px] font-mono text-slate-600 tracking-widest leading-relaxed uppercase italic">
          "I am consistently overconfident by about 28 points on decisions involving other people's behavior, and almost perfectly calibrated on technical decisions."
        </p>
      </div>

      {/* 2. Center/Right: Decision Feed */}
      <div className="w-full xl:w-3/4 flex flex-col gap-8">
        <h3 className="font-mono text-[10px] text-violet-400 uppercase tracking-[0.8em] mb-4">The Decision Artifacts</h3>
        
        <div className="flex flex-col gap-4">
          {decisions.map((d, i) => (
             <motion.div 
               key={d.id} 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="group p-8 border border-white/5 rounded-[2rem] bg-white/[0.02] backdrop-blur-sm hover:bg-white/5 hover:border-violet-500/30 transition-all shadow-2xl relative overflow-hidden"
             >
                {/* Decision Header */}
                <div className="flex justify-between items-start mb-6">
                   <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                         {d.status === 'resolved' ? <CheckCircle size={16} className="text-emerald-400" /> : <Clock size={16} className="text-amber-400" />}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{new Date(d.created_at).toLocaleDateString()}</span>
                         <h4 className="font-serif italic text-xl text-white mt-1">"{d.description}"</h4>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Confidence</span>
                      <span className="text-2xl font-serif italic">{d.predicted_confidence}%</span>
                   </div>
                </div>

                <div className="flex flex-wrap gap-8 items-start pl-14">
                   {/* Assumptions */}
                   <div className="flex-1 min-w-[200px]">
                      <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                         Surfaced Assumptions <ChevronDown size={10} />
                      </span>
                      <ul className="flex flex-col gap-2">
                        {d.assumptions.map((a, j) => (
                           <li key={j} className="text-[11px] font-serif italic text-slate-400 border-l border-white/5 pl-4 py-1 hover:text-white transition-colors">
                              {a}
                           </li>
                        ))}
                      </ul>
                   </div>

                   {/* Outcome & Gap */}
                   {d.status === 'resolved' ? (
                     <div className="w-64 bg-violet-950/5 p-6 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-mono text-emerald-400/50 uppercase tracking-widest mb-3 block">Resolved Outcome</span>
                        <p className="text-xs font-serif italic text-white/80 leading-relaxed mb-4">{d.outcome_note}</p>
                        <div className="flex justify-between items-end border-t border-white/5 pt-4">
                           <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">THE GAP</span>
                           <span className={`text-xl font-serif italic ${d.calibration_gap! > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {d.calibration_gap} pts
                           </span>
                        </div>
                     </div>
                   ) : (
                     <div className="w-64 bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center opacity-40">
                        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">Pending Outcome</span>
                        <div className="w-1 h-1 bg-amber-400 animate-pulse rounded-full" />
                     </div>
                   )}
                </div>
             </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
