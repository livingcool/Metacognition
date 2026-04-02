'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  parallax?: boolean;
}

export const SectionWrapper = ({ children, className = '', parallax = true }: SectionWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y = useTransform(smoothProgress, [0, 1], parallax ? [100, -100] : [0, 0]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.section
      ref={ref}
      style={{ opacity, scale, y }}
      className={`relative min-h-screen flex flex-col items-center justify-center py-24 px-6 md:px-12 lg:px-24 ${className}`}
    >
      <div className="max-w-7xl w-full mx-auto">
        {children}
      </div>
    </motion.section>
  );
};
