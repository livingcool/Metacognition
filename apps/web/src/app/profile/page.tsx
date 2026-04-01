'use client';

import React from 'react';
import { ThinkingDashboard } from '@/components/dashboard/ThinkingDashboard';

/**
 * ProfilePage — The Thinking Dashboard (V4.0)
 * Reimagined as a three-zone horizontal immersion of the user's cognitive evolution.
 */
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Absolute Header for Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-12 flex justify-between pointer-events-none">
        <button 
          onClick={() => window.location.href = '/'}
          className="font-mono text-[9px] uppercase tracking-[0.6em] text-slate-500 hover:text-white transition-colors pointer-events-auto"
        >
          &larr; Exit Protocol
        </button>
      </header>

      <ThinkingDashboard />
    </div>
  );
}

