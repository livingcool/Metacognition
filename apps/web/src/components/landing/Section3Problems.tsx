'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

export const Section3Problems = () => {
  const problems = [
    {
      id: '01',
      title: 'You are probably overconfident by about 28 points.',
      body: `Research on human judgment consistently shows that when people say they're 90% certain about something, they're right roughly 60–65% of the time. The gap between felt confidence and actual accuracy is one of the most consistent findings in cognitive psychology — and almost nobody knows their own number.`,
      action: 'Mirror tracks yours.'
    },
    {
      id: '02',
      title: 'You have a dominant cognitive pattern.',
      body: `It might be confirmation bias. It might be urgency compression. It might be the planning fallacy. You repeat this pattern across decisions, relationships, and work. You've just never been shown it from the outside.`,
      action: 'Mirror names it.'
    },
    {
      id: '03',
      title: 'The assumptions underneath your decisions are almost entirely invisible to you.',
      body: `Not because you're not intelligent — but because that's how assumptions work. They feel like facts. Each one rests on a stack of things you took as given that you never examined. Most decisions fail because of unchecked premises.`,
      action: 'Mirror surfaces them before you act.'
    }
  ];

  return (
    <SectionWrapper className="bg-transparent">
      <div className="space-y-24">
        <div className="text-center space-y-8">
          <h2 className="font-serif text-5xl md:text-7xl text-white">
            Three things you almost certainly <br />
            <span className="text-violet-400">don't know</span> about how you think
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {problems.map((prob, idx) => (
            <motion.div
              key={prob.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.8 }}
              className="p-10 bg-white/5 border border-white/10 rounded-3xl group hover:border-violet-500/40 transition-all duration-500"
            >
              <span className="font-mono text-violet-400/50 group-hover:text-violet-400 transition-colors duration-500 text-4xl mb-8 block">
                {prob.id}
              </span>
              <h3 className="font-serif text-3xl text-white mb-6 leading-tight">
                {prob.title}
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {prob.body}
              </p>
              <p className="font-serif text-xl text-violet-300 italic">
                {prob.action}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
