'use client';

import React from 'react';
import { ThinkingDashboard } from '@/components/dashboard/ThinkingDashboard';
import dynamic from 'next/dynamic';

const MirrorOrb = dynamic(() => import('@/components/MirrorOrb').then(mod => mod.MirrorOrb), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-transparent opacity-0 transition-opacity duration-1000" />
});

/**
 * ProfilePage — The Thinking Dashboard (V4.0)
 * Reimagined as a three-zone horizontal immersion of the user's cognitive evolution.
 */
export default function ProfilePage() {
  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-slate-100 font-serif selection:bg-violet-500/30 overflow-x-hidden">
      
      {/* 2. Atmospheric Layer (Background Mirror) */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-[100vw] h-[100vh]">
          <MirrorOrb intensity={0.20} />
        </div>
      </div>

      {/* Absolute Header for Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-12 flex justify-between pointer-events-none">
        <button 
          onClick={() => window.location.href = '/'}
          className="font-mono text-[9px] uppercase tracking-[0.6em] text-slate-500 hover:text-white transition-colors pointer-events-auto"
        >
          &larr; Exit Protocol
        </button>
      </header>

      <main className="relative z-10 bg-transparent">
        <ThinkingDashboard />
      </main>

      {/* Cinematic Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-zinc-400" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}

