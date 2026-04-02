'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ConceptShowcase — The Philosophy of Metacognition
 * Scroll-linked typography layers that explain exactly what MIRROR is.
 */
export const ConceptShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[150vh] flex flex-col items-center justify-center bg-[#000000] py-32 overflow-hidden">
      
      {/* 1. Backdrop Text — The 'LENS' of Consciousness */}
      <motion.div 
        style={{ y: y1, opacity: 0.05 }}
        className="absolute top-0 left-0 right-0 text-[30vw] font-serif italic text-white whitespace-nowrap pointer-events-none select-none"
      >
        Metacognitive DNA
      </motion.div>

      {/* 2. Primary Narratives */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-12 space-y-96">
        
        {/* Layer 1: The Mirror Interaction */}
        <motion.div 
          style={{ opacity }}
          className="flex flex-col items-start gap-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-violet-500/80">Protocol 01 — Analysis</span>
          <h2 className="text-5xl md:text-8xl italic text-slate-100 font-serif leading-[1.1] max-w-3xl">
            A mirror and a lens,<br/>simultaneously.
          </h2>
          <p className="font-mono text-xs md:text-sm uppercase tracking-widest text-slate-500 max-w-xl leading-loose">
            Mirror does not merely respond. It deciphers your cognitive DNA—identifying the exact moment intuition transforms into bias.
          </p>
        </motion.div>

        {/* Layer 2: The Archaeology of Thought */}
        <motion.div 
          style={{ y: y2 }}
          className="flex flex-col items-end text-right gap-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-emerald-500/80">Protocol 02 — Calibration</span>
          <h2 className="text-5xl md:text-8xl italic text-slate-100 font-serif leading-[1.1] max-w-4xl">
            The archaeology <br/>of your internal dialogue.
          </h2>
          <p className="font-mono text-xs md:text-sm uppercase tracking-widest text-slate-500 max-w-xl leading-loose">
            Everything you think is logged as a cognitive artifact. Every prediction you make is measured against the eventual horizon of reality. 
          </p>
        </motion.div>

      </div>

      {/* 3. Floating Geometric Elements (Concept-Specific) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full">
         {[...Array(5)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-violet-500/10 to-transparent"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                height: `${Math.random() * 400 + 200}px`,
                opacity: 0.1
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
         ))}
      </div>

    </section>
  );
};
