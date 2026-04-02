'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SessionFlow } from '@/components/chat/SessionFlow';
import { LandingContent } from '@/components/landing/LandingContent';
import { Session } from '@mirror/types';

export default function HomePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  // 1. Fetch History for signed-in users
  useEffect(() => {
    if (userLoaded && user) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      fetch(`${apiUrl}/api/sessions/${user.id}`)
        .then(res => res.json())
        .then(data => setSessions(Array.isArray(data) ? data : []))
        .catch(err => console.error('History fetch error:', err));
    }
  }, [user, userLoaded]);

  // If in active session, yield to SessionFlow
  if (activeSessionId) {
    return <SessionFlow sessionId={activeSessionId} />;
  }

  return (
    <main className="relative min-h-screen w-full selection:bg-violet-500/30">
      <LandingContent />
    </main>
  );
}

