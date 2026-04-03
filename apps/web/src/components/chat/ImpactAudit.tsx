'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Brain, Target } from 'lucide-react';

interface ImpactAuditProps {
  sessionId: string;
  onComplete: (data: any) => void;
}

/**
 * ImpactAudit — Post-Session Neural Feedback (Task 3.1)
 * A cinematic, no-typing feedback loop to record metacognitive impact.
 */
export const ImpactAudit = ({ sessionId, onComplete }: ImpactAuditProps) => {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState({
    impact: '',
    resolved: null as boolean | null,
    rating: 0
  });

  const impacts = [
    { id: 'clarity', label: 'Mental Clarity', icon: Brain, color: 'text-emerald-400' },
    { id: 'anxiety', label: 'Reduced Tension', icon: Sparkles, color: 'text-violet-400' },
    { id: 'strategy', label: 'New Strategy', icon: Target, color: 'text-blue-400' },
    { id: 'none', label: 'No Change', icon: XCircle, color: 'text-slate-500' }
  ];

  const handleImpactSelect = (id: string) => {
    setFeedback({ ...feedback, impact: id });
    setStep(2);
  };

  const handleResolvedSelect = (res: boolean) => {
    const finalData = { ...feedback, resolved: res };
    setFeedback(finalData);
    onComplete(finalData);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl prism-glass p-12 rounded-[3rem] border border-white/10 text-center space-y-12"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-serif italic text-white">Neural Impact Detected.</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">How has this reflection shifted your state?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {impacts.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleImpactSelect(item.id)}
                    className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group flex flex-col items-center gap-4"
                  >
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-serif italic text-white">Resolution Audit.</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">Is this cognitive tension resolved for now?</p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleResolvedSelect(true)}
                  className="w-full p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all flex items-center justify-between group"
                >
                  <span className="font-serif italic text-xl text-emerald-400">Yes, it is clearer now.</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleResolvedSelect(false)}
                  className="w-full p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all flex items-center justify-between group"
                >
                  <span className="font-serif italic text-xl text-rose-400">No, more depth is needed.</span>
                  <XCircle className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8 border-t border-white/5 flex justify-center">
            <div className="flex gap-2">
                <div className={`w-12 h-1 rounded-full transition-colors ${step === 1 ? 'bg-violet-500' : 'bg-white/10'}`} />
                <div className={`w-12 h-1 rounded-full transition-colors ${step === 2 ? 'bg-violet-500' : 'bg-white/10'}`} />
            </div>
        </div>
      </motion.div>
    </div>
  );
};
