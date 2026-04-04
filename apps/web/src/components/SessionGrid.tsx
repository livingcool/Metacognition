'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Session } from '@mirror/types';
import { Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SessionGridProps {
  sessions: Session[];
}

export const SessionGrid = ({ sessions }: SessionGridProps) => {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 opacity-30">
        <MessageSquare size={48} strokeWidth={1} className="mb-4" />
        <p className="font-serif italic text-xl">No neural fragments archived yet.</p>
        <Link href="/session/new" className="mt-8 font-mono text-[10px] uppercase tracking-[0.4em] hover:text-violet-400 transition-colors">
          Initialize First Reflection &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
      {sessions.map((session, i) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="group relative"
        >
          <Link href={`/session/${session.id}`}>
            <div className="h-full p-8 border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-[2rem] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-700 flex flex-col justify-between group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Calendar size={12} className="text-violet-400" />
                    <span className="font-mono text-[9px] uppercase tracking-widest">
                      {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${session.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                </div>

                <h3 className="font-serif text-2xl text-white group-hover:text-violet-200 transition-colors mb-4">
                  {session.title || "Neural Reflection"}
                </h3>
                
                <p className="text-slate-400 text-sm italic leading-relaxed line-clamp-3 mb-8">
                  "{session.preview || "An empty neural state waiting for connection..."}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="font-mono text-[8px] text-slate-600 uppercase tracking-widest">
                  FRAGMENT ID: {session.id.substring(0, 8)}
                </span>
                <ArrowRight size={16} className="text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
