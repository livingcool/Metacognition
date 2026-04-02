'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, UserSquare } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

export const Section8Privacy = () => {
  const points = [
    { name: 'Private by Design', icon: ShieldCheck, body: 'Your sessions, cognitive profile, and decision history are yours alone.' },
    { name: 'No Shared Training', icon: Lock, body: 'None of your data is used to train shared AI models.' },
    { name: 'Zero Ad Extraction', icon: EyeOff, body: 'We do not sell data. We do not extract value from your thinking history.' },
    { name: 'Accumulated for You', icon: UserSquare, body: 'The historical record is built solely for your own longitudinal benefit.' }
  ];

  return (
    <SectionWrapper className="bg-transparent py-48">
      <div className="max-w-5xl mx-auto space-y-24">
        <div className="text-center space-y-8">
          <h2 className="font-serif text-5xl md:text-7xl text-white tracking-widest text-center uppercase">
            Your thinking <br />
            <span className="text-violet-400 font-bold italic">stays yours.</span>
          </h2>
          <p className="font-sans text-xl md:text-2xl text-slate-400 leading-relaxed max-w-3xl mx-auto italic">
            Everything you share with Mirror is private by design. 
            Mirror holds your thinking history because that history is the source 
            of its value to you. It is not a resource we extract from. 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {points.map((point, idx) => (
            <motion.div
              key={point.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex gap-8 items-start hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="p-4 bg-violet-600/10 rounded-2xl">
                <point.icon className="w-8 h-8 text-violet-400" />
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-white tracking-tight">
                  {point.name}
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {point.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
