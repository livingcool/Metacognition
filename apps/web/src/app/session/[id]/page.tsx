import React from 'react';
import { SessionFlow } from '@/components/chat/SessionFlow';
import { MirrorOrb } from '@/components/MirrorOrb';
import { motion } from 'framer-motion';

/**
 * Session Page Route (Task 2.2)
 * Renders the primary Mirror session interface.
 */

export default function SessionPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative min-h-screen bg-[#040A0C]">
      {/* Session HUD */}
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
         <div className="flex items-center gap-4 pointer-events-auto">
            {/* Nav Orb Drop (Task 2.3) */}
            <div className="w-10 h-10 -ml-2">
                <MirrorOrb />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-mono text-cyan-200/50 uppercase tracking-[0.4em]">
                  Session Active
               </span>
               <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                  ID: {params.id.slice(0, 8)}
               </span>
            </div>
         </div>
         
         <div className="pointer-events-auto">
            <button className="text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest border border-white/5 bg-white/5 py-2 px-4 rounded-sm transition-all backdrop-blur-md">
               End Session
            </button>
         </div>
      </header>

      {/* Main Flow Orchestrator */}
      <SessionFlow sessionId={params.id} />
    </div>
  );
}
