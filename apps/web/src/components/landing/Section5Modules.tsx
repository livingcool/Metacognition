'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ZoomIn, ShieldAlert, History, Map, Activity, Calendar } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

export const Section5Modules = () => {
  const modules = [
    {
      name: 'Thinking Canvas',
      icon: Layers,
      body: 'Bring a thought before it\'s fully formed. Mirror listens to raw thinking and organises it spatially. It finds the connections you didn\'t see, the contradictions you skipped past, and the assumptions your premises rest on.'
    },
    {
      name: 'Assumption X-ray',
      icon: ZoomIn,
      body: 'Take any plan, any decision, any belief — and paste it in. Mirror surfaces every hidden premise underneath it, ranked by how much weight you\'ve placed on it and how testable it is.'
    },
    {
      name: 'Devil\'s Advocate',
      icon: ShieldAlert,
      body: 'Mirror builds the strongest possible case against your position. Not a strawman — a steelman. The goal isn\'t to change your mind. It\'s to make your thinking unbreakable.'
    },
    {
      name: 'Decision Archaeology',
      icon: History,
      body: 'Log a decision. Come back when the outcome is clear. Mirror runs a gap analysis between original reasoning and reality — showing you which assumptions failed and what the longitudinal pattern is.'
    },
    {
      name: 'Bias Heatmap',
      icon: Map,
      body: 'A 30-day visual map of which cognitive patterns have been most active in your thinking. Not a quiz result. A live fingerprint built from actual sessions, updated continuously.'
    },
    {
      name: 'Calibration Tracker',
      icon: Activity,
      body: 'Every time you express confidence, Mirror notes it. Every outcome, Mirror compares. Over months, you get your personal calibration score — the gap between certainty and reality.'
    },
    {
      name: 'Weekly Mirror',
      icon: Calendar,
      body: 'A 10-minute Sunday session built from your week\'s data. Ends with one signal: the single most important observation about how you thought this week, stated in one precise sentence.'
    }
  ];

  return (
    <SectionWrapper className="bg-transparent">
      <div className="space-y-24">
        <div className="text-center space-y-8">
          <h2 className="font-serif text-5xl md:text-7xl text-white tracking-tight">
            Seven ways to see your <br />
            <span className="text-violet-400">thinking differently</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="p-10 bg-white/5 border border-white/10 rounded-3xl hover:border-violet-500/40 transition-all duration-500 group"
            >
              <div className="mb-8 p-4 w-fit bg-violet-600/10 rounded-2xl group-hover:bg-violet-600/20 transition-all duration-500">
                <mod.icon className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-6">
                {mod.name}
              </h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                {mod.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
