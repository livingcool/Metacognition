'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Decision {
  id: string;
  description: string;
  predicted_confidence: number;
  assumptions: string[];
  status: string;
  created_at: string;
}

export const CalibrationPortal = ({ userId }: { userId: string }) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decisions/${userId}/pending`);
        const data = await res.json();
        setDecisions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch pending decisions:', err);
        setDecisions([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPending();
  }, [userId]);

  const resolve = async (id: string, outcomeType: 'positive' | 'negative' | 'neutral', actualOutcome: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decision/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, outcomeType, actualOutcome })
      });
      setDecisions(decisions.filter(d => d.id !== id));
    } catch (err) {
      console.error('Resolution failed:', err);
    }
  };

  if (loading) return <div className="text-white/20 text-xs animate-pulse">Scanning Neural Archive...</div>;
  if (!Array.isArray(decisions) || decisions.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center space-x-2 text-indigo-400/80 mb-4 opacity-70">
         <span className="text-[10px] uppercase tracking-widest font-bold">Pending Realities</span>
         <div className="h-[1px] flex-1 bg-indigo-500/20" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {decisions.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.05] transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-white/80 text-sm font-medium leading-relaxed max-w-[80%] italic">
                "{d.description}"
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/30 uppercase tracking-tighter">Confidence</span>
                <span className="text-lg font-bold text-indigo-400 leading-none">{d.predicted_confidence}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {d.assumptions?.map((a, i) => (
                <span key={i} className="text-[9px] px-2 py-1 rounded-full bg-white/[0.05] text-white/40 border border-white/5">
                  {a}
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => resolve(d.id, 'positive', 'Hypothesis Validated')}
                className="flex-1 py-2 text-[10px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all"
              >
                Validated
              </button>
              <button 
                onClick={() => resolve(d.id, 'negative', 'Reality Mismatch')}
                className="flex-1 py-2 text-[10px] uppercase tracking-widest font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all"
              >
                Mismatch
              </button>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
