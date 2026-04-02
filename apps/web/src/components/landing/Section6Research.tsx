'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

export const Section6Research = () => {
  const scholars = [
    { name: 'John Flavell', focus: 'Metacognition & Introspection' },
    { name: 'Daniel Kahneman', focus: 'Systematic Cognitive Errors' },
    { name: 'Carol Dweck', focus: 'Belief Updating & Growth' },
    { name: 'David Dunning', focus: 'Perceived vs. Actual Competence' },
    { name: 'Justin Kruger', focus: 'Cognitive Bias in Judgement' },
    { name: 'Chris Argyris', focus: 'Double-Loop Learning Models' }
  ];

  return (
    <SectionWrapper className="bg-transparent py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Left Side: Body Text */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl text-violet-400 uppercase tracking-widest">
              Section 6 — The Research Foundation
            </h2>
            <h3 className="font-serif text-5xl md:text-7xl text-white leading-tight">
              Built on decades of cognitive science. <br />
              <span className="text-slate-500 italic">Not opinion.</span>
            </h3>
          </div>
          
          <div className="space-y-8 text-xl text-slate-300 leading-relaxed max-w-xl">
            <p className="font-bold text-white">
              Mirror's intelligence layer is grounded in peer-reviewed research from some of 
              the most important thinkers in human cognition.
            </p>
            <p>
              John Flavell established that metacognition is learnable and trainable. 
              Daniel Kahneman's work on System 1 and System 2 provides the framework for pattern detection. 
              Chris Argyris's double-loop learning model — the idea that real growth requires examining the premises behind your decisions — is our philosophical core.
            </p>
            <p className="text-sm font-mono text-slate-500 uppercase tracking-widest pt-8 border-t border-white/10">
              Mirror doesn't cite this research as decoration. It uses it operationally.
            </p>
          </div>
        </div>

        {/* Right Side: The Wall of Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scholars.map((scholar, idx) => (
            <motion.div
              key={scholar.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 0.8, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ opacity: 1, scale: 1.02 }}
              className="p-8 border border-white/5 rounded-2xl bg-white/5 hover:bg-violet-600/5 transition-all duration-300"
            >
              <h4 className="text-xl font-serif text-white mb-2">
                {scholar.name}
              </h4>
              <p className="text-sm font-mono text-violet-400/60 uppercase">
                {scholar.focus}
              </p>
            </motion.div>
          ))}
          <div className="col-span-full mt-12 p-8 border border-slate-500/20 italic text-slate-400 text-lg">
            " Intellectual flexibility is not a gift. It is a system we build together. "
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
