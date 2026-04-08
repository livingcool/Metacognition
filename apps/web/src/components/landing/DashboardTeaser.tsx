'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radar, Activity, Archive, LayoutGrid } from 'lucide-react';
import { InteractiveRadar } from './InteractiveRadar';

/**
 * DashboardTeaser — The Thinking Dashboard Preview
 * A visual representation of the 'Now', 'Pattern', and 'History' zones.
 */
export const DashboardTeaser = () => {
  return (
    <section className="relative min-h-screen bg-transparent py-40 px-8 overflow-hidden">
      
      {/* 1. Header Logic */}
      <div className="max-w-7xl mx-auto mb-32 space-y-4">
        <span className="font-mono text-[10px] uppercase tracking-[1em] text-violet-500/60 block animate-pulse">The Architecture</span>
        <h2 className="text-4xl md:text-7xl font-serif italic text-slate-100">The Thinking Dashboard</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500 max-w-xl leading-relaxed">
           Beyond productivity. A three-horizon blueprint of your evolved cognition.
        </p>
      </div>

      {/* 2. Zone Grid Parallax */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Zone 1 — The NOW (Radar) */}
        <motion.div
           whileInView={{ opacity: 1, y: 0 }}
           initial={{ opacity: 0, y: 50 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="prism-glass p-10 rounded-[3rem] border border-violet-500/10 space-y-8 group hover:border-violet-500/30 transition-all overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-20">
             <Radar className="w-6 h-6 text-violet-400 opacity-60" />
             <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">ZONE 1 — THE NOW</span>
          </div>
          <div className="relative z-20">
             <h3 className="text-3xl font-serif italic text-white leading-tight">Live Cognitive Fingerprint</h3>
             <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 leading-relaxed opacity-70 mt-2">
               A real-time measurement of curiosity and skepticism as you think.
             </p>
          </div>
          <div className="relative z-10 -mx-6 -mb-6 aspect-square">
             <InteractiveRadar />
          </div>
        </motion.div>

        {/* Zone 2 — THE PATTERN (Trends) */}
        <motion.div
           whileInView={{ opacity: 1, y: 0 }}
           initial={{ opacity: 0, y: 50 }}
           viewport={{ once: true }}
           transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="prism-glass p-10 rounded-[3rem] border border-emerald-500/10 space-y-8 relative top-12"
        >
          <div className="flex justify-between items-center">
             <Activity className="w-6 h-6 text-emerald-400 opacity-60" />
             <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">ZONE 2 — PATTERNS</span>
          </div>
          <h3 className="text-3xl font-serif italic text-white leading-tight">Bias Heatmaps & Trends</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 leading-relaxed opacity-70">
            Watch the long-term evolution of your calibration score and pattern frequency over 90 days.
          </p>
          <div className="pt-12 grid grid-cols-6 gap-2 opacity-20">
             {[...Array(24)].map((_, i) => (
                <div key={i} className="w-full aspect-square bg-emerald-500/20 rounded-sm" />
             ))}
          </div>
        </motion.div>

        {/* Zone 3 — THE HISTORY (Archaeology) */}
        <motion.div
           whileInView={{ opacity: 1, y: 0 }}
           initial={{ opacity: 0, y: 50 }}
           viewport={{ once: true }}
           transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="prism-glass p-10 rounded-[3rem] border border-slate-500/10 space-y-8 relative top-24"
        >
          <div className="flex justify-between items-center">
             <Archive className="w-6 h-6 text-slate-400 opacity-60" />
             <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">ZONE 3 — HISTORY</span>
          </div>
          <h3 className="text-3xl font-serif italic text-white leading-tight">Decision Archaeology</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 leading-relaxed opacity-70">
            Dig through past predictions, confidence metrics, and the gap between logic and reality.
          </p>
          <div className="pt-12 space-y-4 opacity-10">
             <div className="h-4 w-full bg-slate-100/10 rounded-full" />
             <div className="h-4 w-3/4 bg-slate-100/10 rounded-full" />
             <div className="h-4 w-1/2 bg-slate-100/10 rounded-full" />
          </div>
        </motion.div>

      </div>

      {/* 3. Final Transition Bridge */}
      <div className="mt-96 text-center space-y-8 pb-32">
        <span className="font-mono text-[10px] uppercase tracking-[1em] text-slate-700 block">The Archive awaits</span>
        <LayoutGrid className="w-12 h-12 text-slate-800 mx-auto" />
      </div>

    </section>
  );
};
