'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser, UserButton } from '@clerk/nextjs';
import { SessionFlow } from '@/components/chat/SessionFlow';
import { MirrorOrb } from '@/components/MirrorOrb';
import { SessionFeed } from '@/components/home/SessionFeed';
import { Session } from '@mirror/types';
import { UserCircle, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * HomePage — The Void Focus HUD (Task 2.4 Refactor)
 * Orchestrates the transition from the minimalist landing to the active reflection session.
 * Features: Cinematic entry, Session History Feed, Profile Bridge.
 */
export default function HomePage() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  // 1. Fetch History
  useEffect(() => {
    if (userLoaded && user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/sessions/${user.id}`)
        .then(res => res.json())
        .then(data => setSessions(Array.isArray(data) ? data : []))
        .catch(err => console.error('History fetch error:', err));
    }
  }, [user, userLoaded]);

  // 2. Start New Protocol
  const startReflection = async () => {
    if (!user) return;
    setIsInitializing(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          title: `Reflection ${new Date().toLocaleDateString()}` 
        })
      });
      const data = await res.json();
      if (data.sessionId) {
        setActiveSessionId(data.sessionId);
      }
    } catch (err) {
      console.error('Failed to init session:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  // If in active session, yield to SessionFlow
  if (activeSessionId) {
    return <SessionFlow sessionId={activeSessionId} />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-slate-100 font-serif selection:bg-violet-500/30 overflow-x-hidden">
      
      {/* 1. Atmospheric Layer (Void Mirror) */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20 transition-opacity duration-1000">
        <div className="w-[80vw] h-[80vh]">
          <MirrorOrb intensity={0.15} />
        </div>
      </div>

      {/* 2. Navigation Layer */}
      <nav className="relative z-50 flex justify-between items-center p-8 lg:p-12">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
           </div>
           <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-slate-500">Mirror v0.1-Alpha</span>
        </div>
        
        <div className="flex items-center gap-8">
           <Link 
             href="/profile"
             className="group flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.4em] text-slate-400 hover:text-white transition-all"
           >
             <UserCircle className="w-4 h-4 text-slate-600 group-hover:text-violet-400" />
             <span>Neural Profile</span>
           </Link>
           <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* 3. Hero Perspective */}
      <main className="relative z-10 pt-12">
        <div className="max-w-5xl mx-auto px-12 text-center space-y-12">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-8xl italic text-slate-100 leading-tight">
              The internal lens<br/>is ready.
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.6em] text-slate-500 max-w-xl mx-auto leading-relaxed">
              Witness the patterns of your own mind. <br/>Initiate a new cycle of metacognitive awareness.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <button 
              onClick={startReflection}
              disabled={isInitializing}
              className="group relative px-12 py-6 prism-glass prism-edge rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.5em] text-slate-200">
                  {isInitializing ? 'Calibrating...' : 'Start Reflection'}
                </span>
                <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <div className="flex items-center gap-3">
               <Activity className="w-3 h-3 text-emerald-500/50 animate-pulse" />
               <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-600">Cognitive Link: Active</span>
            </div>
          </motion.div>

        </div>

        {/* 4. History Feed Partition */}
        <div className="mt-48 relative">
           <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
           <div className="pt-24 min-h-[400px]">
              <SessionFeed 
                sessions={sessions} 
                onSelect={(id) => setActiveSessionId(id)} 
              />
           </div>
        </div>
      </main>

      {/* 5. Minimalist Footer */}
      <footer className="py-24 border-t border-white/5 mx-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-700">Rooted AI &copy; 2024</p>
        <div className="flex gap-8 text-[9px] font-mono text-slate-800 uppercase tracking-widest">
           <span className="hover:text-slate-400 cursor-help transition-colors">Privacy Lexicon</span>
           <span className="hover:text-slate-400 cursor-help transition-colors">Neural Terms</span>
        </div>
      </footer>

    </div>
  );
}
