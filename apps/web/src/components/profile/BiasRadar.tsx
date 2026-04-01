'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BiasRadarProps {
  data: {
    curiosity: number;
    analyticalDepth: number;
    skepticism: number;
    reflectiveTendency: number;
    openness: number;
    decisiveness: number;
  };
}

/**
 * BiasRadar — Custom SVG Radar Chart (Task 2.5)
 * Visualizes the 6 explorative DNA dimensions in a HUD style.
 */
export const BiasRadar = ({ data }: BiasRadarProps) => {
  const size = 400;
  const center = size / 2;
  const radius = size * 0.4;
  
  const points = [
    { label: 'Curiosity', value: data.curiosity },
    { label: 'Analytical', value: data.analyticalDepth },
    { label: 'Skepticism', value: data.skepticism },
    { label: 'Reflection', value: data.reflectiveTendency },
    { label: 'Openness', value: data.openness },
    { label: 'Decisiveness', value: data.decisiveness },
  ];

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / points.length - Math.PI / 2;
    const r = radius * (value / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = points
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Grid Circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
          <circle
            key={tick}
            cx={center}
            cy={center}
            r={radius * tick}
            fill="none"
            stroke="white"
            strokeOpacity={0.05}
            strokeDasharray="2 4"
          />
        ))}

        {/* Axis Lines */}
        {points.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="white"
              strokeOpacity={0.1}
            />
          );
        })}

        {/* Data Polygon */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.2)"
          stroke="#8b5cf6"
          strokeWidth="2"
          className="drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
        />

        {/* Labels */}
        {points.map((p, i) => {
          const { x, y } = getCoordinates(i, 115);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="white"
              fillOpacity={0.4}
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              className="uppercase tracking-widest"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
      
      {/* Central Pulse */}
      <div className="absolute w-2 h-2 bg-violet-500 rounded-full blur-[2px] animate-pulse" />
    </div>
  );
};
