'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * RealityLayerOverlay — The Environment Narrative
 * Adds subtle HUD elements and a scan-line to the background.
 */
export const RealityLayerOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      
      {/* 1. Horizontal Scan Line */}
      <motion.div 
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent shadow-[0_0_15px_rgba(124,58,237,0.1)]"
      />

      {/* 2. Fixed HUD Markers (Rule of Thirds Placement) */}
      <div className="absolute inset-0 p-8 lg:p-12">
        
        {/* Top Right: Calibration Status */}
        <div className="absolute top-12 right-12 text-hud flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            <span>CALIBRATION_STABLE</span>
          </div>
          <span>OFFSET: +0.0024ms</span>
        </div>

        {/* Bottom Left: Session Metadata */}
        <div className="absolute bottom-12 left-12 text-hud flex flex-col gap-1">
          <span>REALITY_TENSION: LOW</span>
          <div className="flex gap-4">
            <span className="text-violet-500 opacity-60">L6_WRITE_BACK: ACTIVE</span>
            <span>NODE_SYNC: 100%</span>
          </div>
        </div>

        {/* Bottom Right: Coordinates */}
        <div className="absolute bottom-12 right-12 text-hud font-mono">
          <span>LAT: 28.6139° N</span><br/>
          <span>LON: 77.2090° E</span>
        </div>

      </div>

      {/* 3. Subtle Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

    </div>
  );
};
