'use client';

import React, { Suspense } from 'react';
import { SessionFlow } from '@/components/chat/SessionFlow';

/**
 * SessionPage — Dynamic Profile-based Session Route
 * Path: /[username]/session/[id]
 */
export default function SessionPage({ params }: { params: { id: string, username: string } }) {
  const { id } = params;
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center font-mono text-slate-500 text-[10px] uppercase tracking-widest animate-pulse">Synchronizing Neural Link...</div>}>
      <SessionFlow sessionId={id} />
    </Suspense>
  );
}
