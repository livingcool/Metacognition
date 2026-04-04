'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Session } from '@mirror/types';
import { Calendar, ChevronRight } from 'lucide-react';
import { Logo } from '../Logo';

interface SessionFeedProps {
  sessions: Session[];
  onSelect: (id: string) => void;
}

/**
 * SessionFeed ΓÇö Recent Reflection History (Task 2.4)
 * Displays past sessions in a minimalist HUD grid.
 */
export const SessionFeed = ({ sessions, onSelect }: SessionFeedProps) => {
  if (sessions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-serif italic text-slate-500 text-lg">Your reflection history is a blank canvas.</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-700 mt-4 underline decoration-slate-800">Begin your first protocol above</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 space-y-8 pb-32">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
         <h2 className="font-mono text-[10px] uppercase tracking-[0.8em] text-slate-500">Recent Neural States</h2>
         <span className="font-mono text-[9px] text-slate-700 uppercase tracking-widest">{sessions.length} TOTAL</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.slice(0, 6).map((session, i) => (
          <motion.button
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(session.id)}
            className="prism-glass p-8 rounded-[2rem] border border-white/5 text-left group hover:border-violet-500/30 transition-all hover:bg-white/[0.02]"
          >
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-white/5 rounded-xl group-hover:bg-violet-500/10 transition-colors">
                  <Logo size={16} className="text-slate-400 group-hover:text-white" />
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-violet-400/80 uppercase tracking-tighter">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter mix-blend-difference">
                    {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
               </div>
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="font-serif text-2xl italic text-white group-hover:text-violet-200 transition-colors leading-tight mix-blend-difference">
                {session.title || 'Untitled Reflection'}
              </h4>
              
              {session.preview && (
                <p className="text-slate-400 font-serif italic text-sm line-clamp-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {session.preview}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-violet-400/80 group-hover:text-violet-400 transition-colors">
                <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Open Link</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[8px] font-mono text-slate-700 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">
                {session.status.toUpperCase()}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {sessions.length > 6 && (
        <div className="flex justify-center">
           <button className="font-mono text-[10px] uppercase tracking-[0.6em] text-slate-600 hover:text-slate-200 transition-colors py-4">
              Expand Archive &rarr;
           </button>
        </div>
      )}
    </div>
  );
};
