'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

export const Section2Differentiation = () => {
  const tools = [
    { name: 'Notion', role: 'Organises what you already think.' },
    { name: 'ChatGPT', role: 'Answers what you ask.' },
    { name: 'Journaling', role: 'Records what you feel.' },
    { name: 'Mirror', role: 'Observes the structure of your reasoning.', highlight: true }
  ];

  return (
    <SectionWrapper className="bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Left Side: Statement */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl text-violet-400 uppercase tracking-widest">
              Section 2 — The Sharp Differentiation
            </h2>
            <h3 className="font-serif text-5xl md:text-6xl text-white leading-tight">
              This is not a productivity tool.
            </h3>
          </div>
          
          <div className="space-y-8 text-xl text-slate-400 leading-relaxed max-w-xl">
            <p className="font-bold text-white">
              Productivity tools help you do more. Mirror helps you think better. 
              Those are completely different problems, and almost nothing exists for the second one.
            </p>
            <p>
              None of them observe the structure of your reasoning, the patterns in how you make decisions, 
              the gap between how confident you are and how accurate you actually are.
            </p>
            <p className="text-violet-300 font-serif text-2xl italic pt-4">
              Mirror does only that — and nothing else.
            </p>
          </div>
        </div>

        {/* Right Side: The Grid Comparison */}
        <div className="grid grid-cols-1 gap-6">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`p-10 rounded-2xl border transition-all duration-500 backdrop-blur-sm ${
                tool.highlight 
                  ? 'bg-violet-600/10 border-violet-500/30' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <h4 className={`text-2xl font-serif mb-3 ${tool.highlight ? 'text-violet-400' : 'text-slate-300'}`}>
                {tool.name}
              </h4>
              <p className="text-lg text-slate-400">
                {tool.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
