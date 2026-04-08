'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, ShieldAlert, Zap, HelpCircle, X } from 'lucide-react';

interface DNA {
  curiosity: number;
  analyticalDepth: number;
  skepticism: number;
  reflectiveTendency: number;
  openness: number;
  decisiveness: number;
  assumptionLoad: number;
  emotionalSignal: number;
}

interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dna: DNA;
  patterns: string[];
  rationale?: string;
}

const MetricRow = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-slate-400 uppercase">
      <div className="flex items-center gap-2">
        <Icon size={12} className={color} />
        <span>{label}</span>
      </div>
      <span className={color}>{Math.round(value)}%</span>
    </div>
    <div className="h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "circOut" }}
        className={`absolute inset-y-0 left-0 ${color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`}
        style={{ color: 'inherit' }}
      />
    </div>
  </div>
);

export const AnalysisPanel = ({ isOpen, onClose, dna, patterns, rationale }: AnalysisPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', filter: 'blur(10px)' }}
            animate={{ x: 0, filter: 'blur(0px)' }}
            exit={{ x: '100%', filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border-l border-white/5 z-[101] p-12 overflow-y-auto no-scrollbar font-serif shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-start mb-16">
              <div className="space-y-1">
                <h2 className="text-2xl italic text-white">Cognitive Analysis</h2>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em]">Metacognitive DNA Breakdown</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-10">
              {/* 1. DNA Metrics */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-1 h-1 bg-violet-500 rounded-full animate-pulse" />
                   <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Neural DNA Axes</span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <MetricRow icon={HelpCircle} label="Curiosity" value={dna.curiosity} color="text-violet-400" />
                  <MetricRow icon={Brain} label="Analytical Depth" value={dna.analyticalDepth} color="text-sky-400" />
                  <MetricRow icon={ShieldAlert} label="Skepticism" value={dna.skepticism} color="text-emerald-400" />
                  <MetricRow icon={Activity} label="Reflection" value={dna.reflectiveTendency} color="text-amber-400" />
                  <MetricRow icon={Zap} label="Openness" value={dna.openness} color="text-rose-400" />
                  <MetricRow icon={Activity} label="Decisiveness" value={dna.decisiveness} color="text-indigo-400" />
                </div>

                <div className="pt-6 border-t border-white/5 mt-6">
                  <MetricRow icon={ShieldAlert} label="Assumption Load" value={dna.assumptionLoad} color="text-slate-500" />
                  <div className="mt-4">
                    <MetricRow icon={Activity} label="Emotional Signal" value={dna.emotionalSignal} color="text-pink-500" />
                  </div>
                </div>
              </section>

              {/* 2. Detected Patterns */}
              {patterns.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Pattern Resonance</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patterns.map((p, i) => (
                      <span key={i} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                        {p}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 3. AI Rationale */}
              {rationale && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1 h-1 bg-sky-500 rounded-full animate-pulse" />
                     <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Mirror's Logic</span>
                  </div>
                  <div className="prism-glass p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <p className="text-slate-200 italic leading-relaxed text-sm">
                      "{rationale}"
                    </p>
                  </div>
                </section>
              )}

              {/* 4. Educational Insight */}
              <section className="pt-12 border-t border-white/5">
                <p className="text-[9px] font-mono text-slate-600 leading-relaxed uppercase tracking-[0.2em]">
                  Metacognition is the awareness and understanding of one's own thought processes. Mirror analyzes these patterns to reveal the architecture of your thinking, helping you move beyond bias and into clarity.
                </p>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
