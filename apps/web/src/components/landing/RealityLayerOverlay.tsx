'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, Fingerprint, Activity, MousePointer2 } from 'lucide-react';

/**
 * RealityLayerOverlay — The Interactive HUD (V2.0)
 * Adds pulsing tension nodes, scanning effects, and high-fidelity telemetry.
 */
interface RealityLayerOverlayProps {
  onTensionClick?: (tension: string) => void;
  isInductionComplete?: boolean;
}

export const RealityLayerOverlay = ({ onTensionClick, isInductionComplete = false }: RealityLayerOverlayProps) => {
  const [scanActive, setScanActive] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const tensionPoints = [
    { id: 'bias-leak', label: 'L6_DATA_DRIFT', pos: { top: '30%', left: '20%' }, tension: 'Baseline drift detected in recent decisions.', color: 'rose' },
    { id: 'logic-gap', label: 'CONTRADICTION_FOUND', pos: { top: '65%', right: '25%' }, tension: 'Recent input conflicts with stated long-term goals.', color: 'amber' },
    { id: 'emotional-pulse', label: 'PATHOS_INTENSITY', pos: { top: '15%', right: '15%' }, tension: 'Emotional signal is overriding logical framework.', color: 'indigo' }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden select-none">
      
      {/* 1. Neural Scan Line */}
      <motion.div 
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)]"
      />

      {/* 2. Interactive Tension Pulsars */}
      {onTensionClick && tensionPoints.map((p) => (
        <motion.div
           key={p.id}
           style={{ top: p.pos.top, left: (p.pos as any).left, right: (p.pos as any).right }}
           className="absolute pointer-events-auto"
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3], 
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 20px rgba(244,63,94,0)', 
                '0 0 40px rgba(244,63,94,0.1)', 
                '0 0 20px rgba(244,63,94,0)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => onTensionClick(p.tension)}
            className="group flex flex-col items-center gap-3"
          >
            <div className={`relative w-6 h-6 rounded-full border border-${p.color}-500/40 bg-${p.color}-500/10 flex items-center justify-center`}>
              <div className={`w-2 h-2 bg-${p.color}-500 rounded-full animate-pulse`} />
              
              {/* Outer Rings */}
              <div className={`absolute inset-[-4px] border border-${p.color}-500/10 rounded-full animate-ping [animation-duration:3s]`} />
            </div>

            <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
               <span className={`font-mono text-[8px] text-${p.color}-400 uppercase tracking-[0.4em] bg-black/80 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-xl shadow-2xl`}>
                {p.label}
              </span>
              <div className={`w-px h-8 bg-gradient-to-b from-${p.color}-500/40 to-transparent mt-1`} />
            </div>
          </motion.button>
        </motion.div>
      ))}

      {/* 3. Global HUD Metadata */}
      <div className="absolute inset-0 p-12 lg:p-20 overflow-hidden">
        
        {/* Top Corners: Structural Branding */}
        <div className="absolute top-12 left-12 flex items-center gap-6 opacity-40">
           <div className="p-3 border border-indigo-500/20 bg-indigo-500/5 rounded-xl">
              <Fingerprint size={16} className="text-indigo-400" />
           </div>
           <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.6em] text-white">Neural_OS_v4.2</p>
              <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-slate-500">Node_Sync: Active</p>
           </div>
        </div>

        {/* Top Right: Calibration Telemetry */}
        <div className="absolute top-12 right-12 text-right space-y-4 opacity-40">
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-3">
               <motion.span 
                 animate={{ opacity: [1, 0.4, 1] }} 
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
               />
               <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white">Status: Nominal</span>
             </div>
             <p className="font-mono text-[7px] uppercase tracking-widest text-slate-500 italic">Predictive Error: 0.002%</p>
          </div>
          
          <div className="flex items-center gap-4 justify-end">
             <Activity size={12} className="text-indigo-400 animate-pulse" />
             <div className="h-px w-24 bg-gradient-to-l from-white/10 to-transparent" />
          </div>
        </div>

        {/* Bottom Left: Session Intelligence */}
        <div className="absolute bottom-12 left-12 space-y-6 opacity-30">
          <div className="space-y-2">
             <span className="font-mono text-[8px] uppercase tracking-[0.8em] text-slate-500">Live_Telemetry</span>
             <div className="flex gap-12">
                <div className="space-y-1">
                   <p className="font-mono text-[7px] text-white uppercase tracking-widest">Reality_Tension</p>
                   <p className="font-mono text-xs text-indigo-400">{onTensionClick ? 'STABLE_CRITICAL' : 'BASELINE'}</p>
                </div>
                <div className="space-y-1">
                   <p className="font-mono text-[7px] text-white uppercase tracking-widest">Cognitive_Load</p>
                   <p className="font-mono text-xs text-indigo-400">0.12ms Response</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-px bg-indigo-500/20" />
             <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-slate-600 italic">Mirror_Protocol_L6_Initialized</span>
          </div>
        </div>

        {/* Bottom Right: Spatial Logic (Coordinates) */}
        <div className="absolute bottom-12 right-12 text-right opacity-20">
           <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white tabular-nums">
              X:{mousePos.x.toFixed(2)} Y:{mousePos.y.toFixed(2)}
           </p>
           <p className="font-mono text-[8px] uppercase tracking-widest text-slate-500 mt-1">Spatial_Neural_Map_v1</p>
        </div>

      </div>

      {/* 4. Film Grain / Subtle Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      
      {/* 5. Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

    </div>
  );
};
