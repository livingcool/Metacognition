'use client';

import { motion } from 'framer-motion';

/**
 * RecordingPulse — A cinematic pulse effect for active voice mode (Task 2.x)
 */
export const RecordingPulse = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.4, 0.1, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"
      />
      
      {/* Middle Prismatic Ring */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: 360
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-16 h-16 border-2 border-dashed border-violet-500/20 rounded-full"
      />

      {/* Inner Neural Core */}
      <motion.div
        animate={{
          scale: [0.7, 1.2, 0.7],
          backgroundColor: ["#7c3aed", "#10b981", "#7c3aed"]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-5 h-5 rounded-full shadow-[0_0_25px_rgba(124,58,237,0.6)]"
      />
    </div>
  );
};
