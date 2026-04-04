'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Info, ArrowRight, Plus, X, Zap, Shield, Sparkles, RefreshCw } from 'lucide-react';

interface CalibrationFormProps {
  userId: string;
  onSuccess: (decisionId: string) => void;
  onCancel: () => void;
}

export const CalibrationForm = ({ userId, onSuccess, onCancel }: CalibrationFormProps) => {
  const [description, setDescription] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [newAssumption, setNewAssumption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAssumption = () => {
    if (newAssumption.trim()) {
      setAssumptions([...assumptions, newAssumption.trim()]);
      setNewAssumption('');
    }
  };

  const removeAssumption = (index: number) => {
    setAssumptions(assumptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          description,
          predictedConfidence: confidence,
          assumptions
        })
      });
      const data = await res.json();
      if (data.id || data.success) {
        onSuccess(data.id || 'new-id');
      }
    } catch (err) {
      console.error('Failed to log decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      className="w-full max-w-3xl mx-auto prism-glass p-12 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.1)] relative overflow-hidden"
    >
      {/* Decorative Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-serif text-3xl italic text-white tracking-tight">Log Neural Prediction</h3>
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500 mt-1">Protocol: Calibration Engine v0.4</p>
          </div>
        </div>
        <button 
          onClick={onCancel} 
          className="p-3 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
        {/* 1. Description */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-indigo-500/60 font-bold">01</span>
            <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-400">The Neural Hypothesis</label>
          </div>
          <textarea
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="I believe that if I [Action], then [Outcome] will occur because..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 text-xl font-serif italic text-white placeholder:text-white/10 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all min-h-[160px] shadow-inner"
          />
        </div>

        {/* 2. Confidence Slider (The Neural Balancer) */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-500/60 font-bold">02</span>
                <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-400">Predicted Confidence</label>
              </div>
              <p className="font-mono text-[8px] text-slate-600 uppercase tracking-widest italic">How certain are you of this outcome?</p>
            </div>
            <div className="text-right">
              <span className="text-6xl font-serif italic text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">{confidence}%</span>
            </div>
          </div>
          
          <div className="relative py-6">
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={confidence} 
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full appearance-none h-1 bg-white/10 rounded-full accent-indigo-500 cursor-pointer hover:accent-indigo-400 transition-all"
            />
            <div className="flex justify-between mt-4 px-1 text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em]">
              <span className={confidence < 30 ? 'text-indigo-400 font-bold' : ''}>Speculative</span>
              <span className={confidence >= 30 && confidence < 70 ? 'text-indigo-400 font-bold' : ''}>Calibrated</span>
              <span className={confidence >= 70 ? 'text-indigo-400 font-bold' : ''}>Subjective Certainty</span>
            </div>
          </div>
        </div>

        {/* 3. Assumptions */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/60 font-bold">03</span>
            <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-400">Cognitive Anchors</label>
          </div>
          
          <div className="flex flex-wrap gap-3 min-h-[40px]">
            <AnimatePresence mode="popLayout">
              {assumptions.map((a, i) => (
                <motion.span 
                  key={a}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/5 text-emerald-300 border border-emerald-500/10 text-[10px] font-mono tracking-wider group hover:border-emerald-500/30 transition-all"
                >
                  <Shield size={10} className="text-emerald-500/40" />
                  {a}
                  <button type="button" onClick={() => removeAssumption(i)} className="text-white/20 hover:text-white transition-colors"><X size={12} /></button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-2xl focus-within:border-emerald-500/30 transition-all">
            <input 
              type="text"
              value={newAssumption}
              onChange={(e) => setNewAssumption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAssumption())}
              placeholder="Ex. 'My internal bias toward optimism' or 'Market stability'"
              className="flex-1 bg-transparent px-6 py-4 text-xs text-white placeholder:text-white/10 focus:outline-none font-serif italic"
            />
            <button 
              type="button" 
              onClick={handleAddAssumption}
              className="px-6 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest"
            >
              <Plus size={14} />
              Anchor
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={!description || isSubmitting}
            className="group w-full py-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 font-mono text-[11px] uppercase tracking-[0.6em] hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-all flex items-center justify-center gap-6 disabled:opacity-30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Commit to Neural Archive</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Insight Footer */}
      <div className="mt-12 pt-8 border-t border-white/5 flex items-start gap-4 opacity-50">
        <Info size={14} className="mt-1 text-indigo-400" />
        <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-300 uppercase leading-relaxed tracking-widest">
              Automated Calibration Check
            </p>
            <p className="text-[9px] font-serif italic text-slate-500 leading-relaxed max-w-xl">
              This prediction will remain locked in the Neural Archive. Mirror will surface this context in the Reality Layer once temporal conditions permit resolution. Overcoming overconfidence starts with high-fidelity logging.
            </p>
        </div>
      </div>
    </motion.div>
  );
};
