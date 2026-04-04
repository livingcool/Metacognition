'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Zap, AlertTriangle, Fingerprint, Activity, MousePointer2, Cpu, Terminal, Wifi, ShieldAlert } from 'lucide-react';

/**
 * RealityLayerOverlay — The Atmospheric HUD (V3.0)
 * Elevates the ambient metacognitive experience with deep telemetry, 
 * terminal scrolling, and tension-reactive visual distortions.
 */
interface RealityLayerOverlayProps {
  onTensionClick?: (tension: string) => void;
  isInductionComplete?: boolean;
}

export const RealityLayerOverlay = ({ onTensionClick, isInductionComplete = false }: RealityLayerOverlayProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] Reality_Layer_Alpha_v3.2',
    '[OK] Neural_Sync_Established',
    '[SCAN] Mapping_Cognitive_Drift...',
  ]);
  const [tensionLevel, setTensionLevel] = useState(0.15); // 0.0 to 1.0

  // Standard tension points — in a real app, these would come from the backend/RAG
  const tensionPoints = [
    { id: 'bias-leak', label: 'DRIFT_NODE_01', pos: { top: '25%', left: '15%' }, tension: 'Confirmation bias detected in prediction thread.', color: 'rose' },
    { id: 'logic-gap', label: 'TENSION_NODE_04', pos: { top: '70%', right: '20%' }, tension: 'Conflict detected: Stated values vs. Predicted action.', color: 'amber' },
    { id: 'emotional-pulse', label: 'AFFECT_SIGNAL', pos: { top: '10%', right: '10%' }, tension: 'High emotional variance detected in session tone.', color: 'indigo' }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Simulate live terminal telemetry
    const interval = setInterval(() => {
      const logs = [
        `[DATA] Drift_Delta: ${(Math.random() * 0.05).toFixed(4)}`,
        `[SYNC] Node_${Math.floor(Math.random() * 10)}: Active`,
        `[SCAN] Analyzing_Tension_Field...`,
        `[OK] Heartbeat_Confirmed`
      ];
      setTerminalLogs(prev => [...prev.slice(-15), logs[Math.floor(Math.random() * logs.length)]]);
      
      // Randomly fluctuate tension for visual feedback
      setTensionLevel(prev => Math.min(1, Math.max(0, prev + (Math.random() * 0.1 - 0.05))));
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden select-none">
      
      {/* 0. Displacement / Tension Distortion Layer */}
      {tensionLevel > 0.6 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: (tensionLevel - 0.6) * 0.5 }}
          className="absolute inset-0 bg-transparent backdrop-blur-[2px] transition-all"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}

      {/* 1. Neural Scan Line (High Fidelity) */}
      <motion.div 
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_30px_rgba(99,102,241,0.3)] z-50"
      />

      {/* 2. Interactive Tension Pulsars */}
      {tensionPoints.map((p) => (
        <div
           key={p.id}
           style={{ top: p.pos.top, left: (p.pos as any).left, right: (p.pos as any).right }}
           className="absolute pointer-events-auto"
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4], 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => onTensionClick?.(p.tension)}
            className="group flex flex-col items-center gap-4"
          >
            <div className="relative">
               <div className={`w-8 h-8 rounded-full border border-${p.color}-500/40 bg-${p.color}-500/5 flex items-center justify-center backdrop-blur-md`}>
                  <div className={`w-2 h-2 bg-${p.color}-400 rounded-full animate-pulse`} />
               </div>
               
               {/* Orbital HUD Ring */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className={`absolute -inset-2 border-t border-${p.color}-500/20 rounded-full`}
               />
               
               {/* Probing Crosshair (on hover) */}
               <div className="absolute -inset-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-${p.color}-500/40`} />
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2 bg-${p.color}-500/40`} />
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-${p.color}-500/40`} />
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-${p.color}-500/40`} />
               </div>
            </div>

            <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
               <div className="bg-[#000000]/80 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-lg shadow-2xl flex items-center gap-3">
                  <span className={`font-mono text-[9px] text-${p.color}-400 uppercase tracking-[0.4em]`}>{p.label}</span>
                  <div className="w-1 h-3 bg-white/10 rounded-full" />
                  <span className="font-mono text-[7px] text-white/40 uppercase tracking-widest">{p.id}</span>
               </div>
               <div className={`w-px h-12 bg-gradient-to-b from-${p.color}-500/40 to-transparent`} />
            </div>
          </motion.button>
        </div>
      ))}

      {/* 3. Global HUD Architecture */}
      <div className="absolute inset-0 p-12 lg:p-24 pointer-events-none">
        
        {/* TOP LEFT: CORE STATUS */}
        <div className="absolute top-12 left-12 flex items-start gap-8 opacity-40">
           <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl border border-indigo-500/20 flex items-center justify-center bg-indigo-500/5">
                 <Fingerprint size={20} className="text-indigo-400" />
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-indigo-500/20 to-transparent" />
           </div>
           <div className="space-y-4">
              <div className="space-y-1">
                 <h4 className="font-mono text-[10px] text-white uppercase tracking-[0.6em]">System_Mirror_Protocol</h4>
                 <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest italic">Temporal_Resonance: Nominal</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => <motion.div key={i} animate={{ opacity: [1, 0.2, 1] }} transition={{ delay: i * 0.2, repeat: Infinity, duration: 1.5 }} className="w-1 h-4 bg-emerald-500/40 rounded-full" />)}
                 </div>
                 <span className="font-mono text-[7px] text-emerald-400 uppercase tracking-widest">Core_Sync</span>
              </div>
           </div>
        </div>

        {/* TOP RIGHT: SPECTRAL TELEMETRY */}
        <div className="absolute top-12 right-12 text-right space-y-6 opacity-40">
           <div className="space-y-2">
              <div className="flex items-center gap-4 justify-end">
                 <span className="font-mono text-[9px] text-white uppercase tracking-[0.4em]">Node_Health: 99.4%</span>
                 <Wifi size={14} className="text-indigo-400" />
              </div>
              <div className="h-px w-48 bg-gradient-to-l from-white/20 to-transparent" />
           </div>
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                 <span className="block font-mono text-[7px] text-slate-600 uppercase tracking-widest">Logic_Tension</span>
                 <span className="block font-mono text-xs text-rose-400">{(tensionLevel * 100).toFixed(1)}%</span>
              </div>
              <div className="space-y-1">
                 <span className="block font-mono text-[7px] text-slate-600 uppercase tracking-widest">Cognitive_Drift</span>
                 <span className="block font-mono text-xs text-white">LOW</span>
              </div>
           </div>
        </div>

        {/* BOTTOM LEFT: TERMINAL SCROLL */}
        <div className="absolute bottom-12 left-12 w-64 space-y-6 opacity-30">
           <div className="flex items-center gap-4">
              <Terminal size={14} className="text-indigo-400" />
              <div className="h-px flex-1 bg-white/10" />
           </div>
           <div className="font-mono text-[8px] text-slate-500 space-y-1 h-32 overflow-hidden mask-fade-top flex flex-col justify-end italic">
              {terminalLogs.map((log, i) => (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  key={`${log}-${i}`} 
                  className="whitespace-nowrap"
                >
                  {log}
                </motion.div>
              ))}
           </div>
        </div>

        {/* BOTTOM RIGHT: SPATIAL MAPPING */}
        <div className="absolute bottom-12 right-12 text-right space-y-6 opacity-20">
           <div className="flex flex-col items-end gap-2">
              <MousePointer2 size={16} className="text-white/40" />
              <div className="font-mono text-[11px] text-white tabular-nums tracking-[0.2em]">
                 COORD_{mousePos.x.toFixed(2)}_{mousePos.y.toFixed(2)}
              </div>
           </div>
           <div className="h-2 w-48 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: [-200, 200] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="h-full w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
              />
           </div>
        </div>

      </div>

      {/* 4. Film Grain / Subtle Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      
      {/* 5. Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* 6. Dynamic Distortion (SVG Filter) */}
      <svg className="hidden">
        <defs>
          <filter id="tensionDistort">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={tensionLevel * 20} />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
