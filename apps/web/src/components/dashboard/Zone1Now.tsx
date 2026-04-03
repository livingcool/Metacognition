'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, ResponsiveContainer
} from 'recharts';

interface Zone1Props {
  radarData: any;
  metrics: {
    calibration: number;
    assumptionLoad: number;
    beliefUpdateRate: number;
  };
}

const AXIS_LABELS: Record<string, string> = {
  curiosity: 'CURIOSITY',
  analyticalDepth: 'DEPTH',
  skepticism: 'SKEPTICISM',
  reflectiveTendency: 'REFLECTION',
  openness: 'OPENNESS',
  decisiveness: 'DECISION'
};

export const Zone1Now = ({ radarData, metrics }: Zone1Props) => {
  const chartData = Object.entries(radarData).map(([key, value]) => ({
    subject: AXIS_LABELS[key] || key.toUpperCase(),
    A: value,
    fullMark: 100,
  }));

  return (
    <div className="w-full flex flex-col lg:flex-row gap-12 items-center justify-between py-12 px-12 border-b border-white/5 bg-transparent">
      {/* Left: Headline Metrics */}
      <div className="flex flex-col gap-8 w-full lg:w-1/3">
        <h2 className="font-mono text-[10px] text-violet-400 uppercase tracking-[0.8em] mb-4">Zone 1 // Live Fingerprint</h2>

        <div className="grid grid-cols-1 gap-6">
          {[
            { label: 'Calibration Score', value: metrics.calibration, desc: 'Accuracy of prediction vs outcome', unit: '%' },
            { label: 'Assumption Load', value: metrics.assumptionLoad, desc: 'Reliance on unstated premises', unit: '%' },
            { label: 'Belief Update Rate', value: metrics.beliefUpdateRate, desc: 'Position shifts per 10 sessions', unit: '' }
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group border border-white/5 p-6 rounded-2xl bg-white/[0.02] backdrop-blur-md hover:bg-white/5 transition-all"
            >
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">{m.label}</span>
                <span className="text-3xl font-serif italic text-white">{m.value}{m.unit}</span>
              </div>
              <p className="text-[10px] text-slate-600 italic font-serif leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Center/Right: Radar Chart ftydytdt*/}
      <div className="w-full lg:w-1/2 h-[450px] relative">
        <h3 className="absolute top-0 right-0 font-mono text-[9px] text-slate-700 tracking-widest uppercase">Thinking DNA Axes</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 300 }}
            />
            <Radar
              name="Thinking"
              dataKey="A"
              stroke="#a78bfa"
              fill="#a78bfa"
              fillOpacity={0.15}
              animationDuration={2500}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
