'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface PersistentStitch {
  id: string;
  points: { x: number; y: number }[];
  color: string;
}

interface CognitiveMapProps {
  stitches: PersistentStitch[];
}

export const CognitiveMap: React.FC<CognitiveMapProps> = ({ stitches }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full opacity-30 blur-[2px]">
        {stitches.map((stitch) => (
          <motion.path
            key={stitch.id}
            d={`M ${stitch.points.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
            fill="none"
            stroke={stitch.color}
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          />
        ))}

        {/* Decorative background nebulas */}
        <defs>
          <filter id="nebulaBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
        </defs>
        
        <circle cx="20%" cy="30%" r="15%" fill="rgba(76, 29, 149, 0.15)" filter="url(#nebulaBlur)" />
        <circle cx="80%" cy="70%" r="20%" fill="rgba(6, 78, 59, 0.15)" filter="url(#nebulaBlur)" />
      </svg>
      
      {/* Floating particles/dust for depth */}
      <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`,
                    opacity: 0
                }}
                animate={{ 
                    y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                    opacity: [0, 0.2, 0]
                }}
                transition={{ 
                    duration: 10 + Math.random() * 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                className="w-1 h-1 bg-white rounded-full"
              />
          ))}
      </div>
    </div>
  );
};
