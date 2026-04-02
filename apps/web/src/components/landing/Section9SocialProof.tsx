'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';

export const Section9SocialProof = () => {
  const testimonials = [
    {
      quote: "I had been overconfident on people decisions by 34 points on average. I didn't know that was even a measurable thing. Now I know which decisions to slow down.",
      author: "Founder, Series B"
    },
    {
      quote: "The Assumption X-ray on my company's fundraising pitch found seven premises I'd never questioned. Two of them turned out to be wrong. We caught it before the raise.",
      author: "Investor & CTO"
    },
    {
      quote: "Mirror named my dominant pattern as urgency compression in week three. I still see it every week. I just don't act on it the same way.",
      author: "Senior Researcher"
    }
  ];

  return (
    <SectionWrapper className="bg-transparent py-48">
      <div className="space-y-32">
        <div className="text-center space-y-8">
          <h2 className="font-serif text-5xl md:text-8xl text-white tracking-widest text-center">
            What people <br />
            <span className="text-violet-400">discovered</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="p-12 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group hover:border-violet-500/30 transition-all duration-500"
            >
              {/* Decorative Quote Mark */}
              <div className="absolute top-0 right-0 p-8 opacity-5 font-serif text-9xl text-white">
                "
              </div>
              
              <div className="space-y-8 relative z-10">
                <p className="text-2xl md:text-3xl font-serif text-slate-200 leading-relaxed italic">
                  "{t.quote}"
                </p>
                <p className="text-sm font-mono text-violet-400/60 uppercase tracking-widest">
                   — {t.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
