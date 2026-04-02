'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';
import { Logo } from '@/components/Logo';

export const Section10ClosingCTA = () => {
  return (
    <SectionWrapper className="bg-transparent py-48">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-16">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1, ease: 'easeOut' }}
           className="mb-12"
        >
          <Logo size={120} className="text-violet-500/80 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
        </motion.div>

        <div className="space-y-8">
          <h2 className="font-serif text-5xl md:text-8xl text-white tracking-widest text-center">
            The question is <br />
            <span className="text-violet-400 font-bold">simple.</span>
          </h2>
          
          <div className="space-y-12 text-2xl md:text-3xl text-slate-300 leading-relaxed max-w-4xl italic">
            <p>
              You've been thinking your whole life. You've made hundreds of important decisions. 
              You have patterns you repeat, blind spots you can't see, a gap between how confident 
              you feel and how accurate you actually are.
            </p>
            <p className="text-white font-bold text-4xl">
              Do you know any of that precisely?
            </p>
            <p className="text-slate-500">
              Or are you still discovering it backwards — from the outcomes?
            </p>
          </div>
        </div>

        <div className="pt-16 space-y-12">
          <p className="font-serif text-3xl md:text-4xl text-violet-300">
            Mirror is what changes that.
          </p>
          
          <motion.a 
            href="/chat"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-24 py-8 bg-violet-600 text-white text-3xl font-bold rounded-full transition-all duration-300 hover:bg-violet-500 shadow-2xl shadow-violet-500/40"
          >
            Begin your first session
          </motion.a>
          
          <p className="text-slate-600 text-lg tracking-widest uppercase italic pt-12">
            No productivity metrics. No streaks. No ads. No data sold. <br />
            <span className="text-slate-400 font-bold block mt-4 NOT-ITALIC tracking-normal">JUST A MIRROR.</span>
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
