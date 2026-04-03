'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useUser, UserButton } from '@clerk/nextjs';
import { SessionFlow } from '@/components/chat/SessionFlow';
import { MirrorOrb } from '@/components/MirrorOrb';
import { SessionFeed } from '@/components/home/SessionFeed';
import { Logo } from '@/components/Logo';
import { Session } from '@mirror/types';
import { UserCircle, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

// New Cinematic Components
import { HeroSection } from '@/components/landing/HeroSection';
import { ConceptShowcase } from '@/components/landing/ConceptShowcase';
import { DashboardTeaser } from '@/components/landing/DashboardTeaser';

/**
 * HomePage — The Cinematic Neural Portal (v0.2 Refactor)
 * A scroll-linked narrative experience explaining Metacognition.
 */
export default function HomePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const landingRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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

  // Yield to Active Session
  if (activeSessionId) {
    return <SessionFlow sessionId={activeSessionId} />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-slate-100 font-serif selection:bg-violet-500/30 overflow-x-hidden">
      
      {/* 1. Global Progress / HUD */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-violet-500 origin-left z-[100]" 
        style={{ scaleX }} 
      />

      {/* 2. Atmospheric Layer (Background Mirror) */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-[100vw] h-[100vh]">
          <MirrorOrb intensity={0.20} />
        </div>
      </div>

      {/* 3. Global Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center p-8 lg:px-12 mix-blend-difference">
        <div className="flex items-center gap-6">
           <Logo size={24} className="text-white hover:rotate-180 transition-transform duration-1000" />
           <span className="font-mono text-[9px] uppercase tracking-[0.8em] text-slate-500 hidden md:block">Mirror Alpha v0.2</span>
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

      {/* 4. Cinematic Scroll Narrative */}
      <main className="relative z-10">
        
        {/* Section 1: Hero Entry */}
        <HeroSection onStart={startReflection} isInitializing={isInitializing} />

        {/* Section 2: Concepts & Philosophy */}
        <ConceptShowcase />

        {/* Section 3: The Architecture Teaser */}
        <DashboardTeaser />

        {/* Section 4: The Neural Archive (Session History) */}
        <section className="relative py-40 border-t border-white/5">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-black border border-white/5 rounded-full">
              <LayoutGrid className="w-6 h-6 text-slate-600" />
           </div>
           
           <div className="max-w-5xl mx-auto px-12 text-center mb-24 space-y-6">
              <h2 className="text-4xl md:text-6xl font-serif italic text-white">The Neural Archive</h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Access your past cognitive states</p>
           </div>

           <SessionFeed 
             sessions={sessions} 
             onSelect={(id) => setActiveSessionId(id)} 
           />
        </section>
      </main>

      {/* 5. Refined Footer */}
      <footer className="py-24 border-t border-white/5 mx-12 flex flex-col md:flex-row justify-between items-center gap-6 relative z-50">
        <div className="flex items-center gap-4">
           <Logo size={16} className="text-slate-800" />
           <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-700">Rooted AI &copy; 2024</p>
        </div>
        <div className="flex gap-8 text-[9px] font-mono text-slate-800 uppercase tracking-widest">
           <span className="hover:text-slate-400 cursor-help transition-colors">Digital Ethics</span>
           <span className="hover:text-slate-400 cursor-help transition-colors">Recursive Privacy</span>
        </div>
      </footer>

      {/* Cinematic Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-zinc-400" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

    </div>
  );
}
