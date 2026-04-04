'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Star, Zap, Info, ArrowUpRight, Search, Shield, Target } from 'lucide-react';

interface Zone2Props {
  timeline: any[]; // { date, calibration, assumption, update, dominant_bias }
  biases: any[]; // { name, count, severity }
}

const BIAS_COLORS: Record<string, string> = {
  'Confirmation Bias': 'rgba(96, 165, 250, 0.4)',
  'Overconfidence': 'rgba(248, 113, 113, 0.4)',
  'Urgency Compression': 'rgba(251, 191, 36, 0.4)',
  'Sunk Cost': 'rgba(167, 139, 250, 0.4)',
  'Dunning-Kruger': 'rgba(52, 211, 153, 0.4)',
  'General Reflection': 'rgba(75, 85, 99, 0.4)'
};

/**
 * Zone2Patterns — The Pattern Constellation Explorer (V2.0)
 * Replaces static charts with an interactive, cinematic star-field.
 */
export const Zone2Patterns = ({ timeline, biases }: Zone2Props) => {
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<any | null>(null);

  // Filter stars for the selected nebula
  const activeStars = selectedConstellation 
    ? timeline.filter(t => t.dominant_bias === selectedConstellation || t.dominant_bias === 'General Reflection')
    : timeline.slice(-20); // Show recent 20 by default

  return (
    <div className="relative w-full min-h-[600px] bg-black/20 rounded-[3rem] border border-white/5 overflow-hidden flex flex-col xl:flex-row">
      
      {/* 1. The Constellation Field (Artistic Visualization) */}
      <div className="relative flex-1 min-h-[400px] border-r border-white/5 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.05)_0%,transparent_70%)]">
        
        {/* Background Grids / HUD */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <div className="absolute inset-0 border border-white/5 m-12 rounded-full" />
        </div>

        {/* Neural Nebulas (Biases) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {biases.map((bias, i) => {
             const angle = (i / biases.length) * Math.PI * 2;
             const radius = 180;
             const x = Math.cos(angle) * radius;
             const y = Math.sin(angle) * radius;
             const color = BIAS_COLORS[bias.name] || BIAS_COLORS['General Reflection'];

             return (
               <motion.div
                 key={bias.name}
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1, duration: 1 }}
                 className="absolute w-64 h-64 blur-[80px] rounded-full"
                 style={{ 
                   backgroundColor: color,
                   left: `calc(50% + ${x}px - 128px)`,
                   top: `calc(50% + ${y}px - 128px)`
                 }}
               />
             );
           })}
        </div>

        {/* Interactive Stars (Snapshots) */}
        <div className="absolute inset-0 relative z-10 p-12">
           <AnimatePresence mode="popLayout">
              {activeStars.map((star, i) => {
                // Determine position based on calibration/assumption correlation
                const x = ((star.calibration || 50) / 100) * 80 + 10; // 10% to 90%
                const y = ((star.assumption || 50) / 100) * 80 + 10;
                
                return (
                  <motion.div
                    key={star.date + i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute cursor-pointer"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                  >
                    <div className="relative group">
                       <div className="absolute inset-0 bg-white blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                       <Star 
                         size={8} 
                         className={`transition-all duration-500 ${hoveredStar === star ? 'scale-150 text-white' : 'text-slate-600'}`}
                         fill="currentColor"
                       />
                       {hoveredStar === star && (
                         <motion.div 
                           layoutId="star-glow"
                           className="absolute -inset-4 border border-white/20 rounded-full animate-ping"
                         />
                       )}
                    </div>
                  </motion.div>
                );
              })}
           </AnimatePresence>
        </div>

        {/* Hover Star Detail (Floating Card) */}
        <AnimatePresence>
          {hoveredStar && (
            <motion.div
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-12 left-12 p-6 prism-glass border border-white/10 rounded-2xl z-20 w-72 space-y-4"
            >
               <div className="flex justify-between items-start">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-slate-500">{hoveredStar.date}</span>
                  <div className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[7px] font-mono text-violet-400">STAR_SIGNAL</div>
               </div>
               <div className="space-y-1">
                  <h4 className="font-serif italic text-lg text-white">{hoveredStar.dominant_bias}</h4>
                  <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">Systemic patterns detected in this temporal window.</p>
               </div>
               <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <span className="block font-mono text-[7px] text-slate-600 uppercase tracking-widest">Calibration</span>
                    <span className="text-sm font-serif italic text-emerald-400">{hoveredStar.calibration}%</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[7px] text-slate-600 uppercase tracking-widest">Assumption</span>
                    <span className="text-sm font-serif italic text-rose-400">{hoveredStar.assumption}%</span>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend HUD */}
        <div className="absolute top-8 right-8 flex flex-col gap-4 text-right opacity-40">
           <div className="flex flex-col gap-1">
              <span className="font-mono text-[8px] tracking-[0.2em] text-slate-500 uppercase">X_AXIS: CALIBRATION</span>
              <span className="font-mono text-[8px] tracking-[0.2em] text-slate-500 uppercase">Y_AXIS: ASSUMPTIONS</span>
           </div>
        </div>
      </div>

      {/* 2. Side Panel: Nebula Selection (Bias List) */}
      <div className="w-full xl:w-[400px] p-12 bg-white/[0.01] flex flex-col">
        <div className="space-y-2 mb-12">
          <div className="flex items-center gap-3">
             <Activity size={16} className="text-violet-400" />
             <h3 className="font-serif text-2xl italic text-white tracking-tight">Neural Nebulas</h3>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-600">Filter patterns by cognitive bias</p>
        </div>

        <div className="flex-1 space-y-3">
           <button 
             onClick={() => setSelectedConstellation(null)}
             className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${!selectedConstellation ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 hover:border-white/10'}`}
           >
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:animate-pulse" />
                 <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">Summation Constellation</span>
              </div>
              <ArrowUpRight size={12} className="text-slate-700" />
           </button>

           {biases.map((bias) => (
             <button 
               key={bias.name}
               onClick={() => setSelectedConstellation(bias.name)}
               className={`w-full text-left p-5 rounded-2xl border transition-all flex flex-col gap-3 group ${selectedConstellation === bias.name ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 hover:border-white/10'}`}
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BIAS_COLORS[bias.name] }} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-100">{bias.name}</span>
                   </div>
                   <span className="font-mono text-[9px] text-slate-600">{bias.count} Events</span>
                </div>
                {selectedConstellation === bias.name && (
                   <motion.p 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="text-[10px] font-serif italic text-slate-400 leading-relaxed"
                   >
                     Detected recursive habits of {bias.name.toLowerCase()} affecting decision logic. Focus on historical stars to see divergence.
                   </motion.p>
                )}
             </button>
           ))}
        </div>

        {/* Global Stats Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-8 opacity-60">
           <div className="space-y-1">
             <span className="block font-mono text-[8px] text-slate-600 uppercase tracking-widest">Total Rituals</span>
             <span className="text-2xl font-serif italic text-white">{timeline.length}</span>
           </div>
           <div className="space-y-1">
             <span className="block font-mono text-[8px] text-slate-600 uppercase tracking-widest">Cognitive Drift</span>
             <span className="text-2xl font-serif italic text-rose-400">Moderate</span>
           </div>
        </div>
      </div>

    </div>
  );
};
