'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

export const Section1Opening = () => {
  const { scrollYProgress } = useScroll();
  const yTranslate = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  return (
    <SectionWrapper className="relative py-0 bg-transparent min-h-screen">
      <motion.div style={{ y: yTranslate }} className="flex flex-col items-center text-center space-y-12">
        <div className="space-y-6">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight text-white tracking-tight">
            Most people never find out <br />
            <span className="text-violet-400">how they actually think.</span>
          </h1>
          <p className="max-w-3xl font-sans text-xl md:text-2xl text-slate-400 leading-relaxed mx-auto italic">
            They find out what they decided. What they built. What they lost. 
            But the thinking that produced all of it — the assumptions, the patterns, 
            the blind spots that show up again and again — stays invisible their entire lives.
          </p>
        </div>

        <div className="pt-8">
          <p className="font-serif text-2xl md:text-3xl text-slate-200 mb-12 opacity-80">
            Mirror is the first tool built to change that.
          </p>
          
          <motion.a 
            href="/chat"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 bg-white text-black text-xl font-bold rounded-full transition-all duration-300 hover:bg-violet-400 shadow-2xl shadow-violet-500/20"
          >
            Begin your first session
          </motion.a>
          
          <p className="mt-8 text-slate-500 text-sm tracking-widest uppercase">
            No subscription. Just the action.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-slate-600">Scroll to discover</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-violet-500 to-transparent" 
          />
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
};
