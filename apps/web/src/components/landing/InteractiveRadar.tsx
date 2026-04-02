'use client';

import React, { useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const AXES = [
  'Curiosity',
  'Analytical Depth',
  'Skepticism',
  'Reflective Tendency',
  'Openness',
  'Decisiveness'
];

/**
 * InteractiveRadar — Live Cognitive DNA Demo
 * A morphing SVG radar chart that reacts to cursor proximity.
 */
export const InteractiveRadar = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth mouse tracking for the 'focus center'
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Generate points for the radar polygon
  // We'll slightly animate these points based on 'hover' or mouse position
  const points = useMemo(() => {
    const center = 50;
    const radius = 40;
    
    return AXES.map((_, i) => {
      const angle = (i * 60 - 90) * (Math.PI / 180);
      // Base score 0.5 - 0.8
      const score = 0.6 + Math.random() * 0.2; 
      const x = center + radius * score * Math.cos(angle);
      const y = center + radius * score * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  }, []);

  return (
    <div 
      className="relative w-full aspect-square flex items-center justify-center cursor-crosshair group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(50); mouseY.set(50); }}
    >
      {/* 1. Background Grid */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
        {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
          <circle key={r} cx="50" cy="50" r={40 * r} stroke="currentColor" fill="none" className="text-violet-500" />
        ))}
        {AXES.map((_, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          return (
            <line 
              key={i} 
              x1="50" y1="50" 
              x2={50 + 40 * Math.cos(angle)} y2={50 + 40 * Math.sin(angle)} 
              stroke="currentColor" 
              className="text-violet-500"
            />
          );
        })}
      </svg>

      {/* 2. Interactive Data Polygon */}
      <motion.svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]"
      >
        <motion.polygon
          points={points}
          fill="rgba(139, 92, 246, 0.2)"
          stroke="#8b5cf6"
          strokeWidth="1"
          animate={{
            fill: hoveredIndex !== null ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.2)"
          }}
        />
        
        {/* Dynamic Nodes */}
        {AXES.map((label, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const p = points.split(' ')[i].split(',');
          return (
            <g key={label}>
              <motion.circle
                cx={p[0]}
                cy={p[1]}
                r="1.5"
                fill="#8b5cf6"
                whileHover={{ r: 3 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <text 
                x={50 + 48 * Math.cos(angle)} 
                y={50 + 48 * Math.sin(angle)} 
                textAnchor="middle" 
                className="fill-slate-500 font-mono text-[2.5px] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity"
              >
                {label}
              </text>
            </g>
          );
        })}
      </motion.svg>

      {/* 3. Mouse Tracking Focus Lens */}
      <motion.div 
        style={{ 
          left: useTransform(springX, (x) => `${x}%`), 
          top: useTransform(springY, (y) => `${y}%`) 
        }}
        className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 border border-violet-500/30 rounded-full pointer-events-none flex items-center justify-center"
      >
        <div className="w-1 h-1 bg-violet-500 rounded-full animate-ping" />
      </motion.div>

      {/* 4. Live Calibration Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
         <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-slate-400">
           {hoveredIndex !== null ? `Focus: ${AXES[hoveredIndex]}` : 'Link Calibrated'}
         </span>
      </div>

    </div>
  );
};
