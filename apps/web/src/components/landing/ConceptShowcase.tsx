'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Target, Database, Cpu } from 'lucide-react';

/**
 * ConceptShowcase — The Bento Architecture [Structural]
 * Asymmetric grid visualizing the layers of Mirror.
 */
export const ConceptShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section ref={containerRef} className="relative py-40 px-8 lg:px-24 bg-transparent overflow-hidden">
      
      {/* 1. Header Logic */}
      <div className="max-w-7xl mx-auto mb-20 space-y-4">
        <span className="text-hud">STRUCTURAL_OVERVIEW</span>
        <h2 className="text-5xl md:text-7xl italic text-slate-100 font-serif leading-tight">
          The architecture of <br/>self-directed awareness.
        </h2>
      </div>

      {/* 2. Bento Grid [Golden Ratio Spans] */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-8 auto-rows-[300px] md:auto-rows-[400px]">
        
        {/* Card 1: Protocol 01 (Deep Analysis) */}
        <motion.div 
          className="md:col-span-4 md:row-span-1 prism-glass prism-glass-hover prism-edge p-10 flex flex-col justify-between group"
          whileHover={{ y: -8 }}
        >
          <div className="flex justify-between items-start">
             <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400">
               <Shield className="w-6 h-6" />
             </div>
             <span className="text-hud opacity-20 group-hover:opacity-60">PROTOCOL_01</span>
          </div>
          <div className="space-y-6">
            <h3 className="text-4xl italic text-white font-serif leading-tight">
              A high-precision lens for <br/>cognitive deciphering.
            </h3>
            <p className="font-mono text-xs text-slate-500 tracking-widest max-w-md leading-relaxed uppercase">
               Mirror identifies the exact moment intuition transforms into bias, using recursive analysis to surface logical tension.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Calibration (Stats/Small) */}
        <motion.div 
          className="md:col-span-2 md:row-span-1 prism-glass prism-glass-hover prism-edge p-10 flex flex-col justify-center items-center text-center gap-6 group"
          whileHover={{ y: -8 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <Target className="w-12 h-12 text-emerald-400 relative z-10" />
          </div>
          <div className="space-y-2">
            <span className="block text-4xl font-mono text-white tracking-tighter">98.4%</span>
            <span className="text-hud">REALITY_CALIBRATION</span>
          </div>
        </motion.div>

        {/* Card 3: Memory Archaeology (Large/Bottom) */}
        <motion.div 
          className="md:col-span-3 md:row-span-1 prism-glass prism-glass-hover prism-edge p-10 flex flex-col justify-between group"
          whileHover={{ y: -8 }}
        >
          <div className="flex justify-between items-start">
             <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400">
               <Database className="w-6 h-6" />
             </div>
             <span className="text-hud opacity-20 group-hover:opacity-60">PROTOCOL_02</span>
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl italic text-white font-serif leading-tight">
              Cognitive artifacts,<br/>permanently logged.
            </h3>
            <p className="font-mono text-xs text-slate-500 tracking-widest max-w-xs leading-relaxed uppercase">
               Every prediction is measured against reality. Every thought is a data point in your longitudinal development.
            </p>
          </div>
        </motion.div>

        {/* Card 4: Neural Engine (Visual/Technical) */}
        <motion.div 
          className="md:col-span-3 md:row-span-1 prism-glass prism-glass-hover prism-edge relative p-10 flex flex-col items-center justify-center group overflow-hidden"
          whileHover={{ y: -8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/10 via-transparent to-emerald-900/10 opacity-30 group-hover:opacity-60 transition-opacity" />
          <div className="relative z-10 text-center space-y-8">
             <div className="flex justify-center gap-4">
                <Cpu className="w-10 h-10 text-slate-400 opacity-20" />
                <div className="w-px h-10 bg-white/5" />
                <div className="text-left font-mono text-[9px] tracking-widest text-slate-500 uppercase leading-relaxed">
                   OS_KERNAL: MIRROR_ALPHA<br/>
                   BUILD_ID: 2026.04.03<br/>
                   STATUS: OPTIMAL
                </div>
             </div>
             <h3 className="text-xl md:text-2xl italic text-slate-400 font-serif max-w-xs">
                "The internal dialogue is the only frontier left unexplored."
             </h3>
          </div>
        </motion.div>

      </div>

    </section>
  );
};
