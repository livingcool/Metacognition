'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StitchNode } from '@mirror/types';
import { Brain, Zap, Sparkles, Activity, Link2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StitchCanvasProps {
  nodes: StitchNode[];
  onComplete: (selectedNodeIds: string[]) => void;
  energy?: number;
}

export const StitchCanvas: React.FC<StitchCanvasProps> = ({ 
  nodes, 
  onComplete, 
  energy = 100 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [currentEnergy, setCurrentEnergy] = useState(energy);

  // Randomize initial positions for nodes within the viewport
  const nodePositions = useMemo(() => {
    return nodes.map((node, i) => ({
      ...node,
      x: 15 + Math.random() * 70, // % of width
      y: 20 + Math.random() * 60, // % of height
      delay: i * 0.1
    }));
  }, [nodes]);

  const toggleNode = (nodeId: string, cost: number) => {
    if (selectedIds.includes(nodeId)) {
      setSelectedIds(prev => prev.filter(id => id !== nodeId));
      setCurrentEnergy(prev => prev + cost);
    } else {
      if (currentEnergy >= cost) {
        setSelectedIds(prev => [...prev, nodeId]);
        setCurrentEnergy(prev => prev - cost);
      }
    }
  };

  const handleFinalize = () => {
    if (selectedIds.length > 0) {
      onComplete(selectedIds);
    }
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-transparent rounded-3xl border border-white/5 group">
      {/* Background Grid/Stars */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence>
          {selectedIds.length > 1 && selectedIds.map((id, index) => {
            if (index === 0) return null;
            const prevNode = nodePositions.find(n => n.id === selectedIds[index - 1]);
            const currNode = nodePositions.find(n => n.id === id);
            if (!prevNode || !currNode) return null;

            return (
              <motion.line
                key={`line-${prevNode.id}-${currNode.id}`}
                x1={`${prevNode.x}%`}
                y1={`${prevNode.y}%`}
                x2={`${currNode.x}%`}
                y2={`${currNode.y}%`}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeDasharray="4 4"
                className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
              />
            );
          })}
        </AnimatePresence>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>
      </svg>

      {/* Nodes */}
      {nodePositions.map((node) => (
        <ThoughtNode 
          key={node.id}
          node={node}
          selected={selectedIds.includes(node.id)}
          hovered={hoveredId === node.id}
          onHover={() => setHoveredId(node.id)}
          onLeave={() => setHoveredId(null)}
          onClick={() => toggleNode(node.id, node.energyCost)}
          x={node.x}
          y={node.y}
          delay={node.delay}
        />
      ))}

      {/* HUD: Energy & Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
            <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 pointer-events-auto shadow-2xl">
                <Zap className={cn("w-4 h-4", currentEnergy < 20 ? "text-red-400 animate-pulse" : "text-yellow-400")} />
                <span className="text-xs font-mono tracking-widest uppercase text-white/70">Mental Energy:</span>
                <span className="text-sm font-bold text-white pr-2">{currentEnergy}</span>
                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-500" 
                        initial={{ width: '100%' }}
                        animate={{ width: `${(currentEnergy / energy) * 100}%` }}
                    />
                </div>
            </div>
            
            <AnimatePresence>
                {hoveredId && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="px-4 py-3 bg-violet-950/40 border border-violet-500/30 backdrop-blur-xl rounded-2xl max-w-[280px]"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-violet-400" />
                            <span className="text-[10px] uppercase tracking-tighter text-violet-300 font-bold">Resonance Analysis</span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed italic">
                            "{nodes.find(n => n.id === hoveredId)?.text}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFinalize}
          disabled={selectedIds.length === 0}
          className={cn(
            "pointer-events-auto px-8 py-3 rounded-full font-bold tracking-widest uppercase text-sm transition-all duration-500 flex items-center gap-2",
            selectedIds.length > 0 
              ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] opacity-100" 
              : "bg-white/5 text-white/20 opacity-50 cursor-not-allowed border border-white/5"
          )}
        >
          <Activity className="w-4 h-4" />
          Unfold Insight
        </motion.button>
      </div>

      {/* Decorative center orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
          <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-96 h-96 rounded-full bg-gradient-to-br from-violet-500/20 via-transparent to-emerald-500/20 blur-[40px]" 
          />
      </div>
    </div>
  );
};

const ThoughtNode: React.FC<{
  node: StitchNode;
  selected: boolean;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  x: number;
  y: number;
  delay: number;
}> = ({ node, selected, hovered, onHover, onLeave, onClick, x, y, delay }) => {
    
    const typeIcons = {
        anchor: <Brain className="w-3 h-3" />,
        volatile: <Sparkles className="w-3 h-3" />,
        lens: <Activity className="w-3 h-3" />,
        contradiction: <Zap className="w-3 h-3" />,
        belief: <Link2 className="w-3 h-3" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                x: hovered ? 0 : [0, 5, -5, 0],
                y: hovered ? 0 : [0, -5, 5, 0],
            }}
            transition={{ 
                opacity: { delay, duration: 0.5 },
                scale: { delay, type: 'spring', stiffness: 200, damping: 20 },
                x: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            className="absolute cursor-pointer z-10"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        >
            {/* Visual Aura */}
            <motion.div 
                className={cn(
                    "absolute inset-0 rounded-full blur-xl transition-all duration-700",
                    selected ? "bg-emerald-500/40 opacity-100 scale-150" : "bg-violet-500/20 opacity-0 scale-100 group-hover:opacity-40"
                )}
            />

            {/* Core Disc */}
            <div className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-500 backdrop-blur-md",
                selected 
                    ? "bg-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                    : "bg-black/40 border-white/10 shadow-2xl overflow-hidden"
            )}>
                <div className={cn(
                    "transition-colors duration-500",
                    selected ? "text-black" : "text-white/60"
                )}>
                    {typeIcons[node.type]}
                </div>
                
                {/* Type Label (mini) */}
                {!selected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-white/10 rounded-full border border-white/5">
                        <span className="text-[6px] uppercase tracking-tighter text-white/40">{node.type}</span>
                    </div>
                )}
            </div>

            {/* Energy Cost Indicator */}
            {hovered && !selected && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                    <Zap className="w-2 h-2 text-yellow-400" />
                    <span className="text-[8px] font-mono font-bold text-yellow-200">-{node.energyCost}</span>
                </motion.div>
            )}

            {/* Selection Tick */}
            <AnimatePresence>
                {selected && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#050505]"
                    >
                        <Activity className="w-2 h-2 text-white" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
