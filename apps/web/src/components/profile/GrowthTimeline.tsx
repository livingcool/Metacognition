'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DNAScore } from '@mirror/types';

interface GrowthTimelineProps {
  history: DNAScore[];
}

/**
 * GrowthTimeline — Multi-line SVG Chart (Task 2.5)
 * Visualizes DNA score trends across session history.
 */
export const GrowthTimeline = ({ history }: GrowthTimelineProps) => {
  const width = 800;
  const height = 200;
  const padding = 40;

  if (history.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 font-serif italic">
        <p>Gathering longitudinal data...</p>
        <p className="text-[10px] font-mono uppercase tracking-widest mt-2">3+ sessions required for trend analysis</p>
      </div>
    );
  }

  // Normalize points
  const getX = (index: number) => padding + (index / (history.length - 1)) * (width - 2 * padding);
  const getY = (value: number) => height - padding - (value / 100) * (height - 2 * padding);

  const renderPath = (key: keyof Omit<DNAScore, 'timestamp'>, color: string) => {
    const points = history.map((score, i) => `${getX(i)},${getY(score[key] as number)}`).join(' L ');
    const d = `M ${points}`;

    return (
      <g key={key}>
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
        />
        {/* Glow Path */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          className="blur-md"
        />
      </g>
    );
  };

  return (
    <div className="w-full h-full overflow-visible">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        {/* Grid Lines */}
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padding}
              y1={getY(tick)}
              x2={width - padding}
              y2={getY(tick)}
              stroke="white"
              strokeOpacity={0.05}
              strokeDasharray="4 8"
            />
            <text x={padding - 10} y={getY(tick)} fill="white" fillOpacity={0.2} fontSize="8" fontFamily="monospace" textAnchor="end" alignmentBaseline="middle">{tick}</text>
          </g>
        ))}

        {/* Axis Labels */}
        <text x={width / 2} y={height - 5} fill="white" fillOpacity={0.2} fontSize="8" fontFamily="monospace" textAnchor="middle" className="uppercase tracking-[0.4em]">Timeline (Temporal Sequence)</text>

        {/* Data Paths */}
        {renderPath('assumptionLoad', '#8b5cf6')} {/* Violet */}
        {renderPath('emotionalSignal', '#f59e0b')} {/* Amber */}
        {renderPath('uncertaintyTolerance', '#10b981')} {/* Emerald */}

        {/* Legend */}
        <g transform={`translate(${width - 150}, 10)`}>
           <rect width="140" height="40" fill="black" fillOpacity={0.5} rx="4" />
           <circle cx="10" cy="10" r="3" fill="#8b5cf6" />
           <text x="20" y="13" fill="white" fillOpacity={0.5} fontSize="7" fontFamily="monospace">ASSUMPTIONS</text>
           <circle cx="10" cy="23" r="3" fill="#f59e0b" />
           <text x="20" y="26" fill="white" fillOpacity={0.5} fontSize="7" fontFamily="monospace">EMOTION</text>
           <circle cx="10" cy="35" r="3" fill="#10b981" />
           <text x="20" y="38" fill="white" fillOpacity={0.5} fontSize="7" fontFamily="monospace">UNCERTAINTY</text>
        </g>
      </svg>
    </div>
  );
};
