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

      {/* 2. Zone Grid [Balanced Weight] */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        
        {/* Zone 1 — The NOW (Radar) */}
        <motion.div
           whileInView={{ opacity: 1, y: 0 }}
           initial={{ opacity: 0, y: 40 }}
           viewport={{ once: true }}
           transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="prism-glass p-12 rounded-[2.5rem] border border-violet-500/10 space-y-10 group hover:border-violet-500/30 transition-all overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-20">
             <div className="p-3 rounded-xl bg-violet-500/5 text-violet-400 opacity-60">
                <Radar className="w-5 h-5" />
             </div>
             <span className="text-hud">ZONE_01 — REAL_TIME</span>
          </div>
          <div className="relative z-20">
             <h3 className="text-3xl font-serif italic text-white leading-tight">Live Cognitive <br/>Fingerprint</h3>
             <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 leading-relaxed mt-4 opacity-70">
               A real-time measurement of curiosity and skepticism as you think.
             </p>
          </div>
          <div className="relative z-10 -mx-12 -mb-12 aspect-square saturate-[1.2]">
             <InteractiveRadar />
          </div>
        </motion.div>

        {/* Zone 2 — THE PATTERN (Trends) */}
        <motion.div
           whileInView={{ opacity: 1, y: 0 }}
           initial={{ opacity: 0, y: 40 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="prism-glass p-12 rounded-[2.5rem] border border-emerald-500/10 space-y-10 md:-translate-y-12"
        >
          <div className="flex justify-between items-center">
             <div className="p-3 rounded-xl bg-emerald-500/5 text-emerald-400 opacity-60">
                <Activity className="w-5 h-5" />
             </div>
             <span className="text-hud">ZONE_02 — PATTERNS</span>
          </div>
          <h3 className="text-3xl font-serif italic text-white leading-tight">Bias Heatmaps <br/>& Trends</h3>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 leading-relaxed mt-4 opacity-70">
            Watch the long-term evolution of your calibration score over 90 days.
          </p>
          <div className="pt-8 grid grid-cols-6 gap-2 opacity-10">
             {[...Array(24)].map((_, i) => (
                <div key={i} className="w-full aspect-square bg-emerald-500 rounded-sm" />
             ))}
          </div>
        </motion.div>

        {/* Zone 3 — THE HISTORY (Archaeology) */}
        <motion.div
           whileInView={{ opacity: 1, y: 0 }}
           initial={{ opacity: 0, y: 40 }}
           viewport={{ once: true }}
           transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="prism-glass p-12 rounded-[2.5rem] border border-slate-500/10 space-y-10 md:-translate-y-24"
        >
          <div className="flex justify-between items-center">
             <div className="p-3 rounded-xl bg-slate-500/5 text-slate-400 opacity-60">
                <Archive className="w-5 h-5" />
             </div>
             <span className="text-hud">ZONE_03 — ARCHIVE</span>
          </div>
          <h3 className="text-3xl font-serif italic text-white leading-tight">Decision <br/>Archaeology</h3>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 leading-relaxed mt-4 opacity-70">
            Dig through past predictions and the gap between logic and reality.
          </p>
          <div className="pt-8 space-y-4 opacity-5">
             <div className="h-2 w-full bg-slate-100 rounded-full" />
             <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
             <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
          </div>
        </motion.div>

      </div>

      {/* 3. Final Transition Bridge */}
      <div className="mt-64 text-center space-y-8 pb-32">
        <span className="text-hud">THE_ARCHIVE_AWAITS</span>
        <div className="w-px h-24 bg-gradient-to-b from-slate-800 to-transparent mx-auto" />
      </div>

    </section>
  );
};
