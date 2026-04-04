'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Star, Zap, Info, ArrowUpRight, Search, Shield, Target, Crosshair, Hexagon, Maximize2 } from 'lucide-react';

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
 * Zone2Patterns — The Spectral Neural Scanner (V3.0)
 * Replaces static charts with a cinematic, interactive resonance field.
 */
export const Zone2Patterns = ({ timeline = [], biases = [] }: Zone2Props) => {
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<any | null>(null);
  const [probedStar, setProbedStar] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Filter stars for the selected nebula
  const activeStars = selectedConstellation 
    ? timeline.filter(t => t.dominant_bias === selectedConstellation || t.dominant_bias === 'General Reflection')
    : timeline.slice(-30);

  return (
    <div className="relative w-full min-h-[600px] bg-[#000000]/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 overflow-hidden flex flex-col xl:flex-row">
      
      {/* 1. The Constellation Field (Artistic Visualization) */}
      <div className="relative flex-1 min-h-[500px] border-r border-white/5 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.02)_0%,transparent_70%)]">
        
        {/* 1.1 Dynamic UI Layer: Mouse Scanner */}
        <div 
          className="absolute inset-0 z-0 overflow-hidden cursor-none"
          onMouseMove={handleMouseMove}
        >
          <motion.div 
            animate={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none"
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          />
          <motion.div 
            animate={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
          >
             <div className="relative">
                <Crosshair size={24} className="text-white/20" />
                <div className="absolute top-8 left-8 whitespace-nowrap">
                   <div className="font-mono text-[7px] text-white/40 tracking-[2px]">SCAN_MODE: SPECTRAL</div>
                   <div className="font-mono text-[7px] text-white/20 tracking-[2px]">COORD: {mousePos.x.toFixed(1)}, {mousePos.y.toFixed(1)}</div>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Background Grids / HUD */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
          <div className="absolute inset-0 border border-white/5 m-24 rounded-full" />
          <div className="absolute inset-0 border border-white/5 m-48 rounded-full opacity-50" />
        </div>

        {/* Neural Nebulas (Biases) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {biases.map((bias, i) => {
             const angle = (i / biases.length) * Math.PI * 2;
             const x = Math.cos(angle) * 180;
             const y = Math.sin(angle) * 180;
             const color = BIAS_COLORS[bias.name] || BIAS_COLORS['General Reflection'];

             return (
               <motion.div
                 key={bias.name}
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ 
                   opacity: selectedConstellation === bias.name ? 0.8 : 0.2, 
                   scale: selectedConstellation === bias.name ? 1.4 : 1 
                 }}
                 transition={{ duration: 1.5, ease: "circOut" }}
                 className="absolute w-96 h-96 blur-[120px] rounded-full"
                 style={{ 
                   backgroundColor: color,
                   left: `calc(50% + ${x}px - 192px)`,
                   top: `calc(50% + ${y}px - 192px)`
                 }}
               />
             );
           })}
        </div>

        {/* Interactive Stars (Snapshots) */}
        <div className="absolute inset-0 z-10 p-12">
           <AnimatePresence mode="popLayout">
              {activeStars.map((star, i) => {
                const x = ((star.calibration || 50) / 100) * 80 + 10;
                const y = ((star.assumption || 50) / 100) * 80 + 10;
                const isSelected = probedStar === star;
                
                return (
                  <motion.div
                    key={`${star.date}-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute cursor-pointer group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setProbedStar(star)}
                  >
                    <div className="relative">
                       {isSelected && (
                         <motion.div 
                           initial={{ scale: 0, opacity: 1 }}
                           animate={{ scale: 8, opacity: 0 }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className="absolute -inset-4 border border-white/40 rounded-full"
                         />
                       )}

                       <div className="absolute inset-0 bg-white blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                       <Hexagon 
                         size={isSelected ? 16 : 8} 
                         className={`transition-all duration-700 ${hoveredStar === star || isSelected ? 'text-white' : 'text-slate-700'}`}
                         fill={hoveredStar === star || isSelected ? "white" : "transparent"}
                       />
                    </div>
                  </motion.div>
                );
              })}
           </AnimatePresence>
        </div>

        {/* Probed Star: Spectral Analysis Overlay */}
        <AnimatePresence>
          {probedStar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#000000]/80 backdrop-blur-3xl p-12 flex flex-col justify-center"
            >
               <motion.button 
                 whileHover={{ scale: 1.1, rotate: 90 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={() => setProbedStar(null)}
                 className="absolute top-12 right-12 text-white/40 hover:text-white transition-colors"
               >
                  <Hexagon size={32} />
               </motion.button>

               <div className="max-w-xl space-y-10">
                  <div className="space-y-3">
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="font-mono text-[10px] text-violet-400 tracking-[0.5em] uppercase"
                    >
                      Neural_Snapshot / {probedStar.date}
                    </motion.div>
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="font-serif text-6xl italic text-white leading-[1.1]"
                    >
                      {probedStar.update || "Systemic Resonance Detected"}
                    </motion.h2>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-16"
                  >
                     <div className="space-y-6">
                        <div className="space-y-1">
                          <span className="block font-mono text-[8px] text-slate-500 uppercase tracking-widest">Spectral Bias</span>
                          <span className="text-2xl font-serif italic text-white leading-none">{probedStar.dominant_bias}</span>
                        </div>
                        <p className="text-sm font-serif italic text-slate-400 leading-relaxed">
                          "This moment represents a critical divergence in your cognitive thread. The gap between your assumption and the observed reality creates a high-tension node."
                        </p>
                     </div>

                     <div className="space-y-8">
                        <div className="flex items-end justify-between border-b border-white/10 pb-3">
                           <span className="font-mono text-[8px] text-slate-500 uppercase">Confidence</span>
                           <span className="text-3xl font-serif italic text-emerald-400">{probedStar.calibration || 0}%</span>
                        </div>
                        <div className="flex items-end justify-between border-b border-white/10 pb-3">
                           <span className="font-mono text-[8px] text-slate-500 uppercase">Atmospheric Tension</span>
                           <span className="text-3xl font-serif italic text-rose-400">{probedStar.assumption || 0}%</span>
                        </div>
                     </div>
                  </motion.div>

                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "circInOut" }}
                    className="h-px bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0 w-full"
                  />
                  
                  <div className="flex gap-6 pt-4">
                     <button className="px-8 py-3 rounded-full border border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-white/60 hover:text-white">Trace_Lineage</button>
                     <button className="px-8 py-3 rounded-full bg-white text-black font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Integrate_Insight</button>
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
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-3">
             <Activity size={18} className="text-violet-400 animate-pulse" />
             <h3 className="font-serif text-3xl italic text-white tracking-tight">Neural Nebulas</h3>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-600">Filter patterns by cognitive bias</p>
        </div>

        <div className="flex-1 space-y-4">
           <button 
             onClick={() => setSelectedConstellation(null)}
             className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group ${!selectedConstellation ? 'bg-white/5 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 'bg-transparent border-white/5 hover:border-white/10'}`}
           >
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:animate-pulse" />
                 <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300">Summation Constellation</span>
              </div>
              <ArrowUpRight size={14} className="text-slate-700" />
           </button>

           {biases.map((bias) => (
             <button 
                key={bias.name}
                onClick={() => setSelectedConstellation(bias.name)}
                className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col gap-4 group ${selectedConstellation === bias.name ? 'bg-white/5 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 'bg-transparent border-white/5 hover:border-white/10'}`}
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BIAS_COLORS[bias.name] }} />
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-100">{bias.name}</span>
                   </div>
                   <span className="font-mono text-[10px] text-slate-600">{bias.count} Signals</span>
                </div>
                {selectedConstellation === bias.name && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="space-y-2"
                   >
                     <p className="text-xs font-serif italic text-slate-400 leading-relaxed">
                        Detected recursive habits of {bias.name.toLowerCase()} affecting decision logic. Focus on historical stars to see divergence.
                     </p>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(bias.count / 10) * 100}%` }}
                          className="h-full bg-violet-500/40"
                        />
                     </div>
                   </motion.div>
                )}
             </button>
           ))}
        </div>

        {/* Global Stats Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-8 opacity-60">
           <div className="space-y-1">
             <span className="block font-mono text-[8px] text-slate-500 uppercase tracking-widest">Processed Snapshots</span>
             <span className="text-3xl font-serif italic text-white">{timeline.length}</span>
           </div>
           <div className="space-y-1">
             <span className="block font-mono text-[8px] text-slate-500 uppercase tracking-widest">Cognitive Drift</span>
             <span className="text-3xl font-serif italic text-rose-400">Moderate</span>
           </div>
        </div>
      </div>

    </div>
  );
};
