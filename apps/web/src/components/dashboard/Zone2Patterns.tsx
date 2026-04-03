'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

interface Zone2Props {
  timeline: any[]; // { date, calibration, assumption, update }
  biases: any[]; // { name, count, severity }
}

const BIAS_COLORS: Record<string, string> = {
  'Confirmation Bias': '#60a5fa',
  'Overconfidence': '#f87171',
  'Urgency Compression': '#fbbf24',
  'Sunk Cost': '#a78bfa',
  'Dunning-Kruger': '#34d399',
  'General Reflection': '#4b5563'
};

export const Zone2Patterns = ({ timeline, biases }: Zone2Props) => {
  return (
    <div className="w-full flex flex-col xl:flex-row gap-12 py-12 px-12 border-b border-white/5 bg-transparent min-h-[500px]">
      
      {/* 1. Left: Bias Heatmap (Conceptual 30-day grid) */}
      <div className="w-full xl:w-1/4">
        <h3 className="font-mono text-[10px] text-violet-400 uppercase tracking-[0.8em] mb-8 italic">Pattern Heatmap // 30 Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => {
             // Show last 28 days
             const snapshot = timeline[timeline.length - 28 + i];
             const color = snapshot ? (BIAS_COLORS[snapshot.dominant_bias] || '#4b5563') : '#111';
             return (
               <div 
                 key={i} 
                 className="aspect-square rounded-sm border border-white/5 relative group cursor-help"
                 style={{ backgroundColor: `${color}11` }}
                 title={snapshot ? `${snapshot.date}: ${snapshot.dominant_bias}` : 'No data'}
               >
                 <div 
                   className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity rounded-sm"
                   style={{ backgroundColor: color }}
                 />
                 {snapshot && (
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[6px] text-white font-mono uppercase text-center px-1 leading-tight">{snapshot.dominant_bias.split(' ')[0]}</span>
                   </div>
                 )}
               </div>
             );
          })}
        </div>
        <p className="mt-8 text-[9px] font-mono text-slate-700 tracking-widest uppercase">Patterns tend to cluster. High pressure weeks often spike overconfidence.</p>
      </div>

      {/* 2. Center: Growth Timeline */}
      <div className="w-full xl:w-1/2 h-[350px] flex flex-col">
        <h3 className="font-mono text-[10px] text-violet-400 uppercase tracking-[0.8em] mb-8">Metric Convergence</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
               dataKey="date" 
               axisLine={false} 
               tickLine={false} 
               tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
               interval={7}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
              itemStyle={{ fontSize: '10px' }}
            />
            <Line type="monotone" dataKey="calibration" stroke="#a78bfa" dot={false} strokeWidth={2} name="Calibration" />
            <Line type="monotone" dataKey="assumption" stroke="#60a5fa" dot={false} strokeWidth={1} strokeDasharray="5 5" name="Assumption" />
            <Line type="monotone" dataKey="update" stroke="#34d399" dot={false} strokeWidth={1} name="Belief Update" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Right: Pattern Frequency (Bar Chart) */}
      <div className="w-full xl:w-1/4 flex flex-col h-[350px]">
        <h3 className="font-mono text-[10px] text-violet-400 uppercase tracking-[0.8em] mb-8 self-end">Bias Real Estate</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={biases}>
            <XAxis type="number" hide />
            <YAxis 
               dataKey="name" 
               type="category" 
               axisLine={false} 
               tickLine={false} 
               tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8 }}
               width={120}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {biases.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BIAS_COLORS[entry.name] || '#4b5563'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
