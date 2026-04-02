'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from '@/components/Logo';

export const LandingNav = () => {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(scrollY, [0, 100], ['rgba(0, 0, 0, 0)', 'rgba(3, 3, 3, 0.8)']);
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);
  const borderBottom = useTransform(scrollY, [0, 100], ['1px solid rgba(255, 255, 255, 0)', '1px solid rgba(255, 255, 255, 0.1)']);

  return (
    <motion.nav
      style={{ backgroundColor, backdropBlur, borderBottom }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-6 px-8 md:px-16 transition-all duration-300"
    >
      <Link href="/" className="flex items-center gap-3 group">
        <Logo size={40} className="transition-transform duration-500 group-hover:scale-110" />
        <span className="font-serif text-xl tracking-widest text-slate-100 uppercase opacity-0 group-hover:opacity-100 transition-all duration-500">
          Mirror
        </span>
      </Link>

      <div className="flex items-center gap-8">
        <Link 
          href="/chat" 
          className="relative px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20"
        >
          Begin your first session
        </Link>
      </div>
    </motion.nav>
  );
};
