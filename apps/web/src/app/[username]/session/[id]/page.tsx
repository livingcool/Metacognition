'use client';

import React, { use } from 'react';
import { SessionFlow } from '@/components/chat/SessionFlow';

/**
 * SessionPage — Dynamic Profile-based Session Route
 * Path: /[username]/session/[id]
 */
export default function SessionPage({ params }: { params: Promise<{ id: string, username: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  return <SessionFlow sessionId={id} />;
}
