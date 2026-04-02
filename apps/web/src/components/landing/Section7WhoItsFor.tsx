'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

export const Section7WhoItsFor = () => {
  const whoUsesIt = [
    'Founders making irreversible decisions.',
    'Leaders who suspect they have blind spots.',
    'Researchers and academics.',
    'Writers and creators.',
    'Anyone who understood too late.'
  ];

  const whoItsNotFor = [
    'People who want productivity metrics.',
    'People who want to be told what to do.',
    'People who want an AI to think for them.',
    'People who aren\'t ready to see something uncomfortable.'
  ];

  return (
    <SectionWrapper className="bg-transparent py-48">
      <div className="space-y-32">
        <div className="text-center space-y-8">
          <h2 className="font-serif text-5xl md:text-8xl text-white tracking-tight leading-tight">
            Mirror is for people who take <br />
            <span className="text-violet-400">their thinking seriously.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
          {/* Who uses it */}
          <div className="space-y-12">
            <h3 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-widest border-b border-white/10 pb-8">
              Who uses it
            </h3>
            <ul className="space-y-8">
              {whoUsesIt.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="text-xl md:text-2xl text-slate-300 font-light flex items-center gap-4"
                >
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Who it's not for */}
          <div className="space-y-12">
            <h3 className="font-serif text-3xl md:text-4xl text-slate-500 uppercase tracking-widest border-b border-white/10 pb-8">
              Who it's not for
            </h3>
            <ul className="space-y-8">
              {whoItsNotFor.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="text-xl md:text-2xl text-slate-500 italic flex items-center gap-4 decoration-slate-700 decoration-thick line-through decoration-violet-500/20"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto pt-24 border-t border-white/5 space-y-8">
          <p className="font-serif text-4xl text-white leading-relaxed">
            Mirror does <span className="text-violet-300">not flatter you</span>. 
            That is not a limitation. 
            <span className="italic block mt-4">It is the entire point.</span>
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
