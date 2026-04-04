'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Layers, Globe, Share2 } from 'lucide-react';

interface Choice {
  id: string;
  text: string;
  mode: 'logos' | 'pathos' | 'metanoia' | 'mythos' | 'synthesis';
}

interface MetacognitiveHorizonProps {
  choices: Choice[];
  onChoiceSelect: (choice: Choice) => void;
  isDisabled?: boolean;
  thinkingRationale?: string;
  nodes?: any[];
}

const MODE_COLORS = {
  logos: '#818cf8', // Indigo
  pathos: '#f43f5e', // Rose
  metanoia: '#a78bfa', // Violet
  mythos: '#10b981', // Emerald
  synthesis: '#fbbf24', // Amber
};

const MODE_ICONS = {
  logos: Brain,
  pathos: Zap,
  metanoia: Share2,
  mythos: Globe,
  synthesis: Sparkles,
};

const MODE_LABELS = {
  logos: 'LOGICAL_DECONSTRUCTION',
  pathos: 'EMOTIONAL_SIGNAL',
  metanoia: 'PERSPECTIVE_SHIFT',
  mythos: 'SYMBOLIC_MEANING',
  synthesis: 'INTEGRATED_REFLECTION',
};

/**
 * MetacognitiveHorizon — The Synthesis Vision (V3.0)
 * A cinematic radial interface representing the choice-scape.
 * Features "Neural Threads" and radial bloom transitions.
 */
export const MetacognitiveHorizon = ({ 
  choices = [], 
  onChoiceSelect, 
  isDisabled,
  thinkingRationale 
}: MetacognitiveHorizonProps) => {
  const [hoveredChoice, setHoveredChoice] = useState<Choice | null>(null);
  const [isSelected, setIsSelected] = useState(false);

  // Generate organic fixed positions for the nodes
  const nodePositions = useMemo(() => {
    return (choices || []).map((_, i) => {
      const baseAngle = (i / (choices?.length || 1)) * 2 * Math.PI - Math.PI / 2;
      const finalAngle = baseAngle + (Math.random() - 0.5) * 0.2;
      const finalRadius = 320 + (Math.random() * 60);

      // Control points for the organic "Thread" synapse
      const cpDistance = finalRadius * 0.6;
      const cpAngle = finalAngle + (Math.random() > 0.5 ? 0.4 : -0.4);

      return {
        x: Math.cos(finalAngle) * finalRadius,
        y: Math.sin(finalAngle) * finalRadius,
        cpX: Math.cos(cpAngle) * cpDistance,
        cpY: Math.sin(cpAngle) * cpDistance,
        angle: finalAngle
      };
    });
  }, [choices]);

  const handleSelect = (choice: Choice) => {
    if (isDisabled || isSelected) return;
    setIsSelected(true);
    // Visual delay for the bloom effect before callback
    setTimeout(() => onChoiceSelect(choice), 800);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center pointer-events-none overflow-hidden">
      
      {/* 1. Background Bloom & Atmospheric Depth */}
      <AnimatePresence>
        {hoveredChoice && !isSelected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.15, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute w-[1000px] h-[1000px] rounded-full blur-[180px] z-0"
            style={{ background: `radial-gradient(circle, ${MODE_COLORS[hoveredChoice.mode]}, transparent 70%)` }}
          />
        )}
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 4 }}
            className="absolute inset-0 bg-white z-[100] mix-blend-overlay"
            transition={{ duration: 0.8, ease: "circIn" }}
          />
        )}
      </AnimatePresence>

      {/* 2. Neural Threads (SVG Layer) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
        <defs>
          <filter id="threadGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {choices.map((choice, i) => {
          const pos = nodePositions[i];
          const isHovered = hoveredChoice?.id === choice.id;
          const color = MODE_COLORS[choice.mode];

          return (
            <g key={`thread-${choice.id}`} className="transition-all duration-700">
               {/* Ambient Thread */}
               <motion.path
                 d={`M ${window.innerWidth/2} ${window.innerHeight/2} Q ${window.innerWidth/2 + pos.cpX} ${window.innerHeight/2 + pos.cpY} ${window.innerWidth/2 + pos.x} ${window.innerHeight/2 + pos.y}`}
                 fill="none"
                 stroke={isHovered ? color : 'rgba(255,255,255,0.05)'}
                 strokeWidth={isHovered ? 2 : 1}
                 strokeDasharray={isHovered ? 'none' : '4 4'}
                 initial={{ pathLength: 0, opacity: 0 }}
                 animate={{ pathLength: 1, opacity: 1 }}
                 transition={{ duration: 2, delay: i * 0.1 }}
                 className="transition-all"
               />
               
               {/* Pulsing "Data Packet" on hover */}
               {isHovered && (
                 <motion.circle r="3" fill={color} filter="url(#threadGlow)">
                    <animateMotion 
                      path={`M ${window.innerWidth/2} ${window.innerHeight/2} Q ${window.innerWidth/2 + pos.cpX} ${window.innerHeight/2 + pos.cpY} ${window.innerWidth/2 + pos.x} ${window.innerHeight/2 + pos.y}`}
                      dur="1.5s" 
                      repeatCount="indefinite" 
                    />
                 </motion.circle>
               )}
            </g>
          );
        })}
      </svg>

      {/* 3. Central Synthesis Core */}
      <div className="relative z-50 text-center flex flex-col items-center justify-center max-w-sm">
         <motion.div
           animate={isSelected ? { scale: 0, opacity: 0 } : {}}
           className="relative"
         >
           <AnimatePresence mode="wait">
             {hoveredChoice ? (
                <motion.div
                  key={hoveredChoice.id}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  className="space-y-6"
                >
                   <div className="font-mono text-[9px] tracking-[0.8em] text-white/40 uppercase">Path_Resolution</div>
                   <h2 className="font-serif italic text-3xl text-white px-8 leading-relaxed">"{hoveredChoice.text}"</h2>
                   <div className="flex flex-col items-center gap-2">
                      <span className="font-mono text-[10px] tracking-[0.4em]" style={{ color: MODE_COLORS[hoveredChoice.mode] }}>
                        {MODE_LABELS[hoveredChoice.mode]}
                      </span>
                      <p className="text-slate-400 font-serif italic text-sm opacity-60 px-10">
                        {thinkingRationale || "Calculating the probabilistic weight of this reflection..."}
                      </p>
                   </div>
                </motion.div>
             ) : (
                <motion.div key="idle" className="space-y-4">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center"
                   >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                   </motion.div>
                   <div className="font-mono text-[8px] tracking-[1em] text-slate-500 uppercase">Select_Horizon</div>
                </motion.div>
             )}
           </AnimatePresence>
         </motion.div>
      </div>

      {/* 4. Interactive Nodes (Outer Rim) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         {choices.map((choice, i) => {
           const pos = nodePositions[i];
           const isHovered = hoveredChoice?.id === choice.id;
           const Icon = MODE_ICONS[choice.mode];
           const color = MODE_COLORS[choice.mode];

           return (
             <motion.div
               key={choice.id}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: 1, scale: 1 }}
               style={{
                 left: `calc(50% + ${pos.x}px)`,
                 top: `calc(50% + ${pos.y}px)`,
                 transform: 'translate(-50%, -50%)',
               }}
               className="absolute pointer-events-auto"
             >
               <button
                 onMouseEnter={() => setHoveredChoice(choice)}
                 onMouseLeave={() => setHoveredChoice(null)}
                 onClick={() => handleSelect(choice)}
                 disabled={isDisabled || isSelected}
                 className="relative group flex items-center justify-center p-8 transition-transform active:scale-95"
               >
                  {/* Subtle Node Aura */}
                  <motion.div 
                    animate={{ 
                      scale: isHovered ? 1.5 : 1,
                      opacity: isHovered ? 1 : 0.4
                    }}
                    className="absolute inset-0 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-xl group-hover:border-white/20 transition-all"
                  />

                  {/* Active Selector */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div 
                        layoutId="activeGlow"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 rounded-full blur-2xl"
                        style={{ backgroundColor: `${color}22` }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon Node */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                     <div 
                       className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 bg-black/40 group-hover:bg-white/5 transition-all duration-500"
                       style={isHovered ? { borderColor: `${color}55`, boxShadow: `0 0 30px ${color}11` } : {}}
                     >
                        <Icon size={20} className="text-white/40 group-hover:text-white transition-colors" />
                     </div>
                     <motion.span 
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="font-mono text-[7px] text-white uppercase tracking-[0.4em] whitespace-nowrap bg-black/60 px-3 py-1 rounded-full border border-white/5 scale-90"
                     >
                        {choice.mode}
                     </motion.span>
                  </div>
               </button>
             </motion.div>
           );
         })}
      </div>

      {/* 5. HUD Telemetry Overlays */}
      <div className="absolute inset-12 lg:inset-20 pointer-events-none opacity-20 flex flex-col justify-between">
         <div className="flex justify-between items-start">
            <div className="space-y-1">
               <p className="font-mono text-[9px] text-white tracking-[0.4em] uppercase">Horizon_Engine_v1.0</p>
               <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-indigo-500/40 rounded-full" />)}
               </div>
            </div>
            <p className="font-mono text-[7px] text-slate-500 tracking-[0.2em] uppercase max-w-[120px] text-right">
              Radial_Mapping_Active // Temporal_Gating_Open
            </p>
         </div>
         
         <div className="flex justify-between items-end">
            <div className="p-4 border-l border-white/10 space-y-2">
               <p className="font-mono text-[8px] text-white/40 tracking-[0.4em]">Choice_Complexity</p>
               <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: '60%' }} className="h-full bg-indigo-500/20" />
               </div>
            </div>
            <div className="text-right">
               <p className="font-mono text-[7px] text-slate-600 tracking-[0.8em]">Metacognition_AI</p>
            </div>
         </div>
      </div>

    </div>
  );
};
