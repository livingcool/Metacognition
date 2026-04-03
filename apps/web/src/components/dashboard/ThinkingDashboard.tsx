'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@mirror/db';
import { useUser } from '@clerk/nextjs';
import { Zone1Now } from './Zone1Now';
import { Zone2Patterns } from './Zone2Patterns';
import { Zone3History } from './Zone3History';
import { CognitiveProfile, Decision } from '@mirror/types';
import { LucideShieldCheck, Info } from 'lucide-react';

export const ThinkingDashboard = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Profile (Weekly Insight, Radar, etc.)
        const { data: prof } = await supabase
          .from('cognitive_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // 2. Fetch Decisions (Archaeology)
        const { data: decs } = await supabase
          .from('decisions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // 3. Fetch Snapshots (Heatmap & Trends)
        const { data: snaps } = await supabase
          .from('daily_cognitive_snapshots')
          .select('*')
          .eq('user_id', user.id)
          .order('snapshot_date', { ascending: true })
          .limit(30);

        setProfile(prof as any);
        setDecisions(decs || []);
        setSnapshots(snaps || []);
      } catch (err) {
        console.error('[Dashboard] Data Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-transparent">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full border border-violet-500/30"
        />
      </div>
    );
  }

  // Aggregate stats
  const aggregates = {
    avgGap: Math.round(decisions.filter(d => d.calibration_gap).reduce((a, b) => a + (b.calibration_gap || 0), 0) / (decisions.filter(d => d.calibration_gap).length || 1)),
    failureRate: Math.round((decisions.filter(d => d.status === 'resolved' && d.actual_outcome_binary === false).length / (decisions.filter(d => d.status === 'resolved').length || 1)) * 100)
  };

  const biasAggregation = snapshots.reduce((acc: any, s: any) => {
    acc[s.dominant_bias] = (acc[s.dominant_bias] || 0) + 1;
    return acc;
  }, {});

  const biasData = Object.entries(biasAggregation).map(([name, count]) => ({ name, count }));

  return (
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
      <div className="flex flex-col">
        <Zone1Now 
           radarData={profile.radar_data || {}} 
           metrics={{
             calibration: profile.calibration_score || 0,
             assumptionLoad: snapshots[snapshots.length-1]?.assumption_load || 0,
             beliefUpdateRate: profile.belief_update_rate || 0
           }}
        />

        <Zone2Patterns 
           timeline={snapshots.map(s => ({ 
             date: s.snapshot_date, 
             calibration: s.calibration_score, 
             assumption: s.assumption_load, 
             update: s.belief_update_count 
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
