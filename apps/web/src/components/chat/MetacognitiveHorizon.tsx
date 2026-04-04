'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  logos: '#60a5fa', // Blue
  pathos: '#fbbf24', // Amber
  metanoia: '#a78bfa', // Violet
  mythos: '#34d399', // Emerald
  synthesis: '#fde047', // Yellow
};

const MODE_LABELS = {
  logos: 'LOGICAL DECONSTRUCTION',
  pathos: 'EMOTIONAL SIGNAL',
  metanoia: 'PERSPECTIVE SHIFT',
  mythos: 'SYMBOLIC MEANING',
  synthesis: 'INTEGRATED REFLECTION',
};

export const MetacognitiveHorizon = ({ 
  choices = [], 
  onChoiceSelect, 
  isDisabled,
  thinkingRationale 
}: MetacognitiveHorizonProps) => {
  const [hoveredChoice, setHoveredChoice] = useState<Choice | null>(null);

  // Generate organic fixed positions so layout doesn't jump on renders
  const nodePositions = useMemo(() => {
    return (choices || []).map((_, i) => {
      const baseAngle = (i / (choices?.length || 1)) * 2 * Math.PI - Math.PI / 2;
      // Add organic jitter
      const angleJitter = (Math.random() - 0.5) * 0.5;
      const radiusJitter = (Math.random() - 0.5) * 100;
      
      const finalAngle = baseAngle + angleJitter;
      const finalRadius = 340 + radiusJitter; // Increased Radius to prevent overlap

      // Control points for the bezier synapse
      const cpRadius = finalRadius * 0.5;
      const cpAngle = finalAngle + (Math.random() > 0.5 ? 0.3 : -0.3);

      return {
        x: Math.cos(finalAngle) * finalRadius,
        y: Math.sin(finalAngle) * finalRadius,
        cp1x: Math.cos(cpAngle) * cpRadius,
        cp1y: Math.sin(cpAngle) * cpRadius
      };
    });
  }, [choices]);

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none -translate-y-[10vh]">
      
      {/* 1. Synapse Backdrop Glow */}
      <AnimatePresence>
        {hoveredChoice && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ backgroundColor: MODE_COLORS[hoveredChoice.mode] }}
          />
        )}
      </AnimatePresence>

      {/* 2. Neural Constellation SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {/* Glowing Neurons Filter */}
        <defs>
          <filter id="glow-synapse" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {choices.map((choice, i) => {
          const pos = nodePositions[i];
          const isHovered = hoveredChoice?.id === choice.id;
          const color = MODE_COLORS[choice.mode];

          // We use percentages for the center, and translate locally inside path string for SVG complexity
          // We will construct the path from 50%, 50% down to the calculated xy offset
          
          return (
             <g key={`synapse-${choice.id}`} style={{ transformOrigin: '50% 50%' }}>
               <motion.path
                 d={`M 0 0 Q ${pos.cp1x} ${pos.cp1y} ${pos.x} ${pos.y}`}
                 fill="none"
                 stroke={isHovered ? color : "rgba(255,255,255,0.08)"}
                 strokeWidth={isHovered ? 3 : 1}
                 filter={isHovered ? 'url(#glow-synapse)' : 'none'}
                 initial={{ pathLength: 0, opacity: 0 }}
                 animate={{ pathLength: 1, opacity: 1 }}
                 transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                 style={{ transform: 'translate(50%, 50%)' }}
               />
               
               {/* Firing Particle along Synapse on Hover */}
               {isHovered && (
                 <motion.circle
                   r={4}
                   fill={color}
                   filter="url(#glow-synapse)"
                   style={{ transform: 'translate(50%, 50%)' }}
                 >
                   <animateMotion 
                     path={`M 0 0 Q ${pos.cp1x} ${pos.cp1y} ${pos.x} ${pos.y}`}
                     dur="1.5s" 
                     repeatCount="indefinite"
                     keyPoints="0;1"
                     keyTimes="0;1"
                     calcMode="linear"
                   />
                 </motion.circle>
               )}
             </g>
          );
        })}
      </svg>

      {/* 3. Central Core: Active Rationale */}
      <div className="absolute z-20 text-center max-w-[320px] pointer-events-none">
        <AnimatePresence mode="wait">
          {hoveredChoice ? (
            <motion.div 
              key={hoveredChoice.id}
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              className="space-y-4 backdrop-blur-2xl bg-black/5 p-6 rounded-3xl border border-white/5 shadow-2xl"
            >
              <h3 className="font-serif italic text-2xl text-white mix-blend-difference break-words px-8">"{hoveredChoice.text}"</h3>
              <p className="text-[10px] font-mono tracking-[0.6em] uppercase mix-blend-difference opacity-80" style={{ color: MODE_COLORS[hoveredChoice.mode] }}>
                {MODE_LABELS[hoveredChoice.mode]}
              </p>
              <p className="text-slate-300 font-serif italic text-sm leading-relaxed max-w-[280px] mx-auto opacity-70 mix-blend-difference">
                {thinkingRationale || "Illuminating this neural pathway..."}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 relative"
            >
              <div className="absolute -inset-4 border border-white/5 rounded-full animate-ping opacity-20" />
              <div className="w-2 h-2 bg-white/30 rounded-full mx-auto animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
              <p className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.8em]">Select a node</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Synaptic Nodes (Interactive Choices) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {choices.map((choice, i) => {
          const pos = nodePositions[i];
          const isActive = hoveredChoice?.id === choice.id;
          const color = MODE_COLORS[choice.mode];

          return (
            <motion.div
              key={choice.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 80, delay: 0.5 + i * 0.1 }}
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-auto"
            >
              <motion.button
                onMouseEnter={() => setHoveredChoice(choice)}
                onMouseLeave={() => setHoveredChoice(null)}
                onClick={() => !isDisabled && onChoiceSelect(choice)}
                disabled={isDisabled}
                className="group relative flex flex-col items-center justify-center"
              >
                {/* Visual Node Core */}
                <motion.div 
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md relative z-10"
                  animate={{
                     scale: isActive ? 1.4 : 1,
                     backgroundColor: isActive ? `${color}33` : 'rgba(0,0,0,0.6)',
                     borderColor: isActive ? color : 'rgba(255,255,255,0.05)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-[10px] font-mono tracking-widest text-white/70 mix-blend-difference group-hover:text-white transition-colors">
                    {choice.mode.substring(0,2).toUpperCase()}
                  </span>

                  {isActive && (
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="absolute inset-0 rounded-full shadow-[0_0_30px_currentColor] pointer-events-none"
                       style={{ color }}
                    />
                  )}
                </motion.div>

                {/* Satellite Floating Rings (The Orbitals) */}
                <AnimatePresence>
                   {!isActive && (
                     <motion.div
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="absolute w-20 h-20 rounded-full border border-white/5 pointer-events-none"
                     />
                   )}
                </AnimatePresence>

              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
