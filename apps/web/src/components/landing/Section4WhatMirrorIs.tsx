'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

export const Section4WhatMirrorIs = () => {
  return (
    <SectionWrapper className="bg-transparent">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl text-violet-400 uppercase tracking-widest text-center">
            The Definition
          </h2>
          <h3 className="font-serif text-5xl md:text-7xl text-white text-center leading-tight">
            A thinking environment. <br />
            <span className="text-slate-500 italic">Not a chat. Not a quiz.</span>
          </h3>
        </div>

        <div className="space-y-12 text-xl md:text-2xl text-slate-300 leading-relaxed text-center font-light">
          <p>
            Mirror is a structured space where you bring a thought — a decision you're making, 
            a situation you're wrestling with, a belief you hold — and Mirror reflects it back to you. 
            Not with advice. Not with answers. 
          </p>
          <p className="font-bold text-white">
            With precise observations about the structure of how you're thinking, 
            grounded in research from cognitive psychology and decision science.
          </p>
          <p>
            It detects patterns in your language. It connects what you're saying to what you've said before, 
            across weeks and months. It surfaces the assumptions you didn't know you were making. 
            It holds a growing record of how you think — a cognitive fingerprint that becomes 
            more accurate the longer you use it.
          </p>
          <p className="text-violet-300 font-serif text-3xl italic pt-8">
            Over time, Mirror builds something no other tool can: a longitudinal map of your thinking.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
