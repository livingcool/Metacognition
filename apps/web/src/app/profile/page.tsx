'use client';

import React from 'react';
import { ThinkingDashboard } from '@/components/dashboard/ThinkingDashboard';
import { MirrorOrb } from '@/components/MirrorOrb';

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
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

