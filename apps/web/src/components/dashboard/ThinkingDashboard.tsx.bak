'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useAuth } from '@clerk/nextjs';
import dynamic from 'next/dynamic';

const Zone1Now = dynamic(() => import('./Zone1Now').then(m => m.Zone1Now), { ssr: false });
const Zone2Patterns = dynamic(() => import('./Zone2Patterns').then(m => m.Zone2Patterns), { ssr: false });
const Zone3History = dynamic(() => import('./Zone3History').then(m => m.Zone3History), { ssr: false });
const CalibrationPortal = dynamic(() => import('./CalibrationPortal').then(m => m.CalibrationPortal), { ssr: false });
const CognitiveInsights = dynamic(() => import('./CognitiveInsights').then(m => m.CognitiveInsights), { ssr: false });

import { CognitiveProfile, Decision } from '@mirror/types';
import { LucideShieldCheck, Info } from 'lucide-react';

export const ThinkingDashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 1. Fetch Profile (Weekly Insight, Radar, etc.)
        const profRes = await fetch(`${apiUrl}/api/profile/${user.id}`, { headers });
        const prof = await profRes.json();

        // 2. Fetch Decisions (Archaeology)
        const decsRes = await fetch(`${apiUrl}/api/decisions/${user.id}`, { headers });
        const decs = await decsRes.json();

        // 3. Fetch Snapshots (Heatmap & Trends)
        const snapsRes = await fetch(`${apiUrl}/api/profile/${user.id}/trends`, { headers });
        const snaps = await snapsRes.json();

        setProfile(prof);
        setDecisions(decs || []);
        setSnapshots(snaps || []);
      } catch (err) {
        console.error('[Dashboard] Data Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, getToken]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen w-full bg-transparent text-slate-100 font-serif selection:bg-violet-500/30">
        <div className="w-full h-16 xl:h-20 flex items-center justify-center bg-gradient-to-r from-transparent via-violet-950/20 to-transparent border-y border-white/5 relative overflow-hidden">
           <motion.div 
             animate={{ opacity: [0.2, 0.5, 0.2] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="flex items-center gap-4 text-xs xl:text-sm font-serif italic text-violet-200/40"
           >
             <LucideShieldCheck size={14} className="text-violet-400/30" />
             <span>Syncing with the Mirror's edge...</span>
           </motion.div>
        </div>
        <div className="flex flex-col items-center justify-center pt-[20vh]">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-32 h-32 rounded-full border border-violet-500/20 flex items-center justify-center"
          >
             <div className="w-1 h-1 bg-violet-400 rounded-full animate-ping" />
          </motion.div>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const aggregates = {
    avgGap: Math.round(decisions.filter(d => d.calibration_error).reduce((a, b) => a + (b.calibration_error || 0), 0) / (decisions.filter(d => d.calibration_error).length || 1)),
    failureRate: Math.round((decisions.filter(d => d.status === 'resolved' && (d.calibration_error || 0) > 40).length / (decisions.filter(d => d.status === 'resolved').length || 1)) * 100)
  };

  const biasAggregation = (snapshots || []).reduce((acc: any, s: any) => {
    if (s.dominant_bias) {
      acc[s.dominant_bias] = (acc[s.dominant_bias] || 0) + 1;
    }
    return acc;
  }, {});

  const biasData = Object.entries(biasAggregation).map(([name, count]) => ({ name, count: count as number }));

  return (
    <div className="min-h-screen w-full bg-transparent text-slate-100 font-serif selection:bg-violet-500/30">
      
      {/* 0. Weekly Insight Line (The Voice of Mirror) */}
      <div className="w-full h-16 xl:h-20 flex items-center justify-center bg-gradient-to-r from-transparent via-violet-950/20 to-transparent border-y border-white/5 relative overflow-hidden group">
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-4 text-xs xl:text-sm font-serif italic text-violet-200/80"
         >
           <LucideShieldCheck size={14} className="text-violet-400 group-hover:animate-pulse" />
           <span>{profile.weekly_insight || "This week your confidence on people-related decisions rose 12 points but your accuracy didn't follow — worth watching."}</span>
           <Info size={12} className="text-slate-600 cursor-help" />
         </motion.div>
         {/* Animated Scanning Line */}
         <motion.div 
           animate={{ x: ['100%', '-100%'] }}
           transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
           className="absolute bottom-0 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-20"
         />
      </div>

      {/* Main Dashboard Scrollable Content */}
      <div className="flex flex-col space-y-12">
        <div className="px-12 max-w-7xl mx-auto w-full pt-12">
           <CognitiveInsights profile={profile} aggregates={aggregates} />
        </div>

        <Zone1Now 
           radarData={profile.radar_data || {}} 
           metrics={{
             calibration: profile.calibration_score || 0,
             assumptionLoad: snapshots.length > 0 ? snapshots[snapshots.length-1].assumption_load : 0,
             beliefUpdateRate: profile.belief_update_rate || 0
           }}
        />

        <div className="px-12 max-w-4xl mx-auto w-full">
           <CalibrationPortal userId={user?.id || ''} />
        </div>

        <Zone2Patterns 
           timeline={(snapshots || []).map(s => ({ 
             date: s.snapshot_date, 
             calibration: s.calibration_score, 
             assumption: s.assumption_load, 
             update: s.belief_update_count,
             dominant_bias: s.dominant_bias || 'General Reflection'
           }))}
           biases={biasData.length > 0 ? biasData : [{ name: 'General Reflection', count: 1 }]}
        />

        <Zone3History 
           decisions={decisions}
           aggregates={aggregates}
        />
      </div>

      {/* Footer Branding */}
      <footer className="py-24 px-12 opacity-10 flex border-t border-white/5 bg-transparent">
         <span className="font-mono text-[9px] uppercase tracking-[1em]">Mirror Metacognitive Protocol // V4.0</span>
      </footer>
    </div>
  );
};
