'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Target, Info, ArrowRight, Plus, X, Zap, Shield, Sparkles, RefreshCw, Hexagon } from 'lucide-react';

interface CalibrationFormProps {
  userId: string;
  onSuccess: (decisionId: string) => void;
  onCancel: () => void;
}

/**
 * CurvatureScale — A cinematic circular selector for predicted confidence.
 * Replaces the standard slider with a high-fidelity arc interaction.
 */
const CurvatureScale = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const dragX = useMotionValue(0);
  
  // Standardize the value into a 0-100 range based on drag distance
  // We'll simulate a 400px wide track for the 'virtual' drag
  const constrainedValue = useTransform(dragX, [-200, 200], [0, 100]);
  const springValue = useSpring(constrainedValue, { damping: 30, stiffness: 200 });

  useEffect(() => {
    // Synchronize external value to drag position if changed externally
    const initialPos = ((value - 50) / 100) * 400;
    dragX.set(initialPos);
  }, []);

  return (
    <div className="relative h-64 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
         <div className="w-[500px] h-[500px] border border-white/5 rounded-full" />
         <div className="w-[400px] h-[400px] border border-white/5 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* The Arc Visualizer */}
        <svg viewBox="0 0 400 120" className="w-full h-auto overflow-visible">
          {/* Background Track */}
          <path 
             d="M 50 100 Q 200 20 350 100" 
             fill="none" 
             stroke="rgba(255,255,255,0.05)" 
             strokeWidth="12" 
             strokeLinecap="round" 
          />
          {/* Active Fill */}
          <motion.path 
             d="M 50 100 Q 200 20 350 100" 
             fill="none" 
             stroke="url(#arcGradient)" 
             strokeWidth="12" 
             strokeLinecap="round"
             style={{ 
               pathLength: value / 100,
               filter: `drop-shadow(0 0 15px rgba(129,140,248,${value / 200}))`
             }}
          />
          
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* The Drag Handle (Neural Node) */}
        <motion.div 
          drag="x"
          dragConstraints={{ left: -150, right: 150 }}
          dragElastic={0.1}
          style={{ x: dragX }}
          onDrag={(e, info) => {
            const newValue = Math.min(100, Math.max(0, ((info.point.x - e.currentTarget.getBoundingClientRect().left + 150) / 300) * 100));
            // Actual calculated value is cleaner from the MotionValue transform
            const v = Math.round(constrainedValue.get());
            onChange(v);
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group"
        >
          <div className="relative">
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }} 
               transition={{ repeat: Infinity, duration: 3 }}
               className="absolute -inset-8 bg-indigo-500/10 blur-xl rounded-full" 
             />
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] border-4 border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Target size={20} className="text-indigo-600" />
             </div>
             
             {/* Dynamic Feedback Ripples */}
             <AnimatePresence>
               {value > 80 && (
                 <motion.div 
                   initial={{ scale: 0.5, opacity: 0 }}
                   animate={{ scale: 3, opacity: [0, 0.5, 0] }}
                   exit={{ opacity: 0 }}
                   transition={{ repeat: Infinity, duration: 1 }}
                   className="absolute inset-0 border border-indigo-400/30 rounded-full pointer-events-none"
                 />
               )}
             </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Tension HUD */}
      <div className="absolute bottom-4 inset-x-0 flex justify-between px-12 pointer-events-none">
         <div className="text-left">
            <div className="font-mono text-[7px] text-slate-500 tracking-[0.3em]">STATE: {value < 30 ? 'SPECULATIVE' : value < 70 ? 'CALIBRATED' : 'SUBJECTIVE_CERTAINTY'}</div>
            <div className="font-mono text-[7px] text-slate-700 tracking-[0.3em]">RESISTANCE: {Math.round(value * 0.1)}%</div>
         </div>
         <div className="text-right">
            <div className="font-mono text-[7px] text-slate-500 tracking-[0.3em]">PROBABILITY_FIELD</div>
            <div className="font-mono text-[7px] text-indigo-400 tracking-[0.3em] font-bold">ALPHA_RESONANCE</div>
         </div>
      </div>
    </div>
  );
};

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
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 20 }}
      className="w-full max-w-4xl mx-auto bg-[#000000]/60 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-[0_0_150px_rgba(99,102,241,0.05)] relative overflow-hidden"
    >
      {/* Cinematic Overlays */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-0 right-0 p-8">
         <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 h-3 bg-white/5 rounded-full" />
            ))}
         </div>
      </div>

      <div className="flex items-start justify-between mb-16 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Target size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-serif text-4xl italic text-white tracking-tight">Log Neural Prediction</h3>
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500 mt-1">Calibration_Engine / v2.10_Cinematic</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onCancel} 
          className="group p-4 rounded-full bg-white/5 border border-white/5 hover:border-white/10 text-white/20 hover:text-white transition-all"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-20">
        {/* Section 01: Hypothesis */}
        <div className="space-y-8 px-4">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-indigo-500/40">01_LOGIC</span>
            <div className="h-px flex-1 bg-white/5" />
            <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500">The Neural Hypothesis</label>
          </div>
          <textarea
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="I believe that if I [Action], then [Outcome] will occur because..."
            className="w-full bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-12 text-2xl font-serif italic text-white placeholder:text-white/5 focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.03] transition-all min-h-[200px]"
          />
        </div>

        {/* Section 02: Confidence (Curvature Scale) */}
        <div className="space-y-10">
          <div className="flex items-center gap-6 px-4">
            <span className="font-mono text-[10px] text-indigo-500/40">02_WEIGHT</span>
            <div className="h-px flex-1 bg-white/5" />
            <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500">Subjective Confidence</label>
          </div>
          
          <div className="relative">
             <CurvatureScale value={confidence} onChange={setConfidence} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-8xl font-serif italic text-white/10">{confidence}%</span>
             </div>
          </div>
        </div>

        {/* Section 03: Anchors */}
        <div className="space-y-8 px-4">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-indigo-500/40">03_ROOTS</span>
            <div className="h-px flex-1 bg-white/5" />
            <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500">Cognitive Anchors</label>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <AnimatePresence mode="popLayout">
              {assumptions.map((a, i) => (
                <motion.div 
                  key={a}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-4 px-6 py-3 rounded-full bg-indigo-500/5 text-indigo-300 border border-indigo-500/10 text-[11px] font-mono tracking-widest group hover:border-indigo-500/30 transition-all"
                >
                  <Hexagon size={12} className="text-indigo-500/40" />
                  {a}
                  <button type="button" onClick={() => removeAssumption(i)} className="text-white/20 hover:text-white transition-colors"><X size={14} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 p-3 bg-white/[0.01] border border-white/5 rounded-3xl focus-within:border-indigo-500/20 transition-all">
            <input 
              type="text"
              value={newAssumption}
              onChange={(e) => setNewAssumption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAssumption())}
              placeholder="Anchor a recursive bias or atmospheric condition..."
              className="flex-1 bg-transparent px-8 py-5 text-lg text-white placeholder:text-white/5 focus:outline-none font-serif italic"
            />
            <button 
              type="button" 
              onClick={handleAddAssumption}
              className="px-10 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.4em]"
            >
              <Plus size={16} />
              Set_Anchor
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-12 px-4">
          <button
            type="submit"
            disabled={!description || isSubmitting}
            className="group w-full py-10 rounded-[3rem] bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 font-mono text-xs uppercase tracking-[0.8em] hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all flex items-center justify-center gap-8 disabled:opacity-20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            {isSubmitting ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <>
                <div className="relative">
                   <div className="absolute inset-0 blur-lg bg-indigo-400/50" />
                   <Sparkles className="w-5 h-5 text-indigo-300 relative" />
                </div>
                <span>Commit to Neural Archive</span>
                <ArrowRight size={20} className="group-hover:translate-x-4 transition-all" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Insight Footer */}
      <div className="mt-20 pt-10 border-t border-white/5 flex items-start gap-6 opacity-40 px-4">
        <Info size={16} className="mt-1 text-indigo-400" />
        <div className="space-y-3">
            <p className="text-[11px] font-mono text-slate-300 uppercase leading-relaxed tracking-[0.4em]">
              Protocol: Locked_Session_Persistence
            </p>
            <p className="text-[11px] font-serif italic text-slate-500 leading-relaxed max-w-2xl">
              This prediction will be processed through the Reality Layer once temporal conditions permit resolution. Overcoming overconfidence starts with high-fidelity logging.
            </p>
        </div>
      </div>
    </motion.div>
  );
};
