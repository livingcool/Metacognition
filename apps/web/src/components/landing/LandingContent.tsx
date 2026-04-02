'use client';

import React from 'react';
import { LandingNav } from './LandingNav';
import { Section1Opening } from './Section1Opening';
import { Section2Differentiation } from './Section2Differentiation';
import { Section3Problems } from './Section3Problems';
import { Section4WhatMirrorIs } from './Section4WhatMirrorIs';
import { Section5Modules } from './Section5Modules';
import { Section6Research } from './Section6Research';
import { Section7WhoItsFor } from './Section7WhoItsFor';
import { Section8Privacy } from './Section8Privacy';
import { Section9SocialProof } from './Section9SocialProof';
import { Section10ClosingCTA } from './Section10ClosingCTA';

export const LandingContent = () => {
  return (
    <div className="relative">
      <LandingNav />
      <Section1Opening />
      <Section2Differentiation />
      <Section3Problems />
      <Section4WhatMirrorIs />
      <Section5Modules />
      <Section6Research />
      <Section7WhoItsFor />
      <Section8Privacy />
      <Section9SocialProof />
      <Section10ClosingCTA />
      
      <footer className="py-24 border-t border-white/5 mx-12 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em]">Mirror &copy; 2024 — Metacognition Machine</p>
        <div className="flex gap-8 text-[9px] font-mono uppercase tracking-widest">
           <span className="hover:text-violet-400 cursor-help transition-colors">Privacy Lexicon</span>
           <span className="hover:text-violet-400 cursor-help transition-colors">Research Index</span>
        </div>
      </footer>
    </div>
  );
};
