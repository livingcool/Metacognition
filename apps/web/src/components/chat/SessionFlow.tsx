'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { InputField } from './InputField';
import { MetacognitiveHorizon } from './MetacognitiveHorizon';
import { AnalysisPanel } from './AnalysisPanel';
import { MirrorOrb } from '../MirrorOrb';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { Activity, Map as MapIcon, Layers } from 'lucide-react';
import { StitchCanvas } from './StitchCanvas';
import { CognitiveMap } from './CognitiveMap';
import { ImpactAudit } from './ImpactAudit';
import { supabase } from '@mirror/db';
import { CalibrationPortal } from '../dashboard/CalibrationPortal';
import { CalibrationForm } from './CalibrationForm';
import { Zone2Patterns } from '../dashboard/Zone2Patterns';
import { RealityLayerOverlay } from '../landing/RealityLayerOverlay';
import { CognitiveProfile } from '@mirror/types';
import { ChoiceCards } from './ChoiceCards';

/**
 * SessionFlow — The Core Cinematic Orchestrator (V4.0)
 * Editorial asymmetric layout, 3D orbits, and profound initial greeting.
 */

interface SessionFlowProps {
  sessionId: string;
}

const INITIAL_MESSAGE = {
  role: 'assistant',
  reflection: "Welcome to Mirror. I am here to help you dissect your cognitive architecture and illuminate the patterns beneath your conscious awareness.",
  question: "Before we begin the protocol, please describe what you feel or describe your thinking: how you think, and what situation resulted in that type of thinking.",
  dnaScores: {
    curiosity: 0,
    analyticalDepth: 0,
    skepticism: 0,
    reflectiveTendency: 0,
    openness: 0,
    decisiveness: 0,
    assumptionLoad: 0,
    emotionalSignal: 0
  }
};

export const SessionFlow = ({ sessionId }: SessionFlowProps) => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'calibration' | 'reality' | 'patterns' | 'chat' | 'synthesis' | undefined>();
  const [energy, setEnergy] = useState(100);
  const [persistentStitches, setPersistentStitches] = useState<any[]>([]);
  const [view, setView] = useState<'reflection' | 'archeology'>('reflection');
  
  // Feature Data State
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [biasData, setBiasData] = useState<any[]>([]);
  const [isLoadingFeatureData, setIsLoadingFeatureData] = useState(false);
  const [showCalibrationForm, setShowCalibrationForm] = useState(false);
  const [realityTensionNode, setRealityTensionNode] = useState<string | null>(null);
  
  const [status, setStatus] = useState<'active' | 'completed'>('active');
  const [showFeedback, setShowFeedback] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const MAX_TURNS = 8;

  // 0. Fetch History on Mount
  useEffect(() => {
    if (!user || !sessionId) return;

    const fetchHistory = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
        
        // Fetch session status first
        const sRes = await fetch(`${apiUrl}/api/sessions/${user.id}`);
        const sData = await sRes.json();
        const currentSession = sData.find((s: any) => s.id === sessionId);
        if (currentSession?.status === 'completed') {
            setStatus('completed');
        }

        const res = await fetch(`${apiUrl}/api/session/${sessionId}/history`);
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(m => ({
            role: m.role,
            reflection: m.content,
            question: m.metadata?.question,
            choices: m.metadata?.choices,
            nodes: m.metadata?.nodes,
            dnaScores: m.metadata?.dnaScores,
            thinkingRationale: m.metadata?.thinkingRationale,
            patternDetected: m.metadata?.patternDetected,
            realityContext: m.metadata?.realityContext
          }));
          setMessages(mapped);
          setTurnCount(mapped.filter(m => m.role === 'user').length);
        } else {
          setMessages([]); // Set to empty to trigger auto-init if needed
        }
      } catch (err) {
        console.error('[SessionFlow] History Fetch Error:', err);
        setMessages([INITIAL_MESSAGE]);
      }
    };

    fetchHistory();
  }, [user, sessionId]);

  // 0b. Handle Initial Mode from URL
  useEffect(() => {
    const initialMode = searchParams.get('mode');
    const validModes = ['calibration', 'reality', 'patterns', 'chat', 'synthesis'];
    if (initialMode && validModes.includes(initialMode)) {
        setActiveMode(initialMode as any);
        // Special: If we're on reality, we don't necessarily need feature data yet,
        // but for patterns/calibration we do.
    }
  }, [searchParams]);

  // 0c. Fetch Feature Specific Data
  useEffect(() => {
    if (!user || (activeMode !== 'patterns' && activeMode !== 'calibration')) return;

    const fetchFeatureData = async () => {
      setIsLoadingFeatureData(true);
      try {
        const { data: prof } = await supabase
          .from('cognitive_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const { data: snaps } = await supabase
          .from('daily_cognitive_snapshots')
          .select('*')
          .eq('user_id', user.id)
          .order('snapshot_date', { ascending: true })
          .limit(30);

        setProfile(prof as any);
        setSnapshots(snaps || []);
        
        if (snaps) {
            const aggregation = snaps.reduce((acc: any, s: any) => {
                acc[s.dominant_bias] = (acc[s.dominant_bias] || 0) + 1;
                return acc;
            }, {});
            setBiasData(Object.entries(aggregation).map(([name, count]) => ({ name, count })));
        }
      } catch (err) {
        console.error('[SessionFlow] Feature Data Fetch Error:', err);
      } finally {
        setIsLoadingFeatureData(false);
      }
    };

    fetchFeatureData();
  }, [user, activeMode]);

  // 1. Voice & Audio State
  const { isRecording, isTranscribing, stream, toggleRecording } = useVoiceRecorder((text: string) => {
    setUserInput(prev => prev + (prev ? ' ' : '') + text);
  });
  const { amplitude } = useAudioAnalyzer(stream);

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const dnaScores = lastAssistantMsg?.dnaScores || INITIAL_MESSAGE.dnaScores;
  const harvestedDone = useRef(false);

  const handleSendMessage = useCallback(async (text: string, isChoice: boolean = false, mode?: any) => {
    if (isStreaming || !user) return;

    const targetMode = mode || activeMode || 'chat';
    if (mode) setActiveMode(mode);
    setIsStreaming(true);
    setTurnCount(prev => prev + 1);
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const response = await fetch(`${apiUrl}/api/session/${sessionId}/message?text=${encodeURIComponent(text)}&userId=${user.id}&isChoice=${isChoice}&mode=${targetMode}`);
      
      if (!response.ok) throw new Error('Stream Connection Failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let currentTurn: any = { role: 'assistant', reflection: '' };
      let buffer = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (part.startsWith('data: ')) {
             try {
               const jsonStr = part.replace(/^data: /, '').trim();
               if (!jsonStr || jsonStr === '[DONE]') continue;
               const data = JSON.parse(jsonStr);
               
               if (data.reflection) {
                  currentTurn = { 
                    ...currentTurn, 
                    ...data,
                    reflection: (currentTurn.reflection || '') + (data.reflection !== currentTurn.reflection ? data.reflection : '')
                  };
                } else if (data.realityContext) {
                  currentTurn = { ...currentTurn, realityContext: data.realityContext };
                } else {
                  currentTurn = { ...currentTurn, ...data };
                }
               
               setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === 'assistant') {
                     return [...prev.slice(0, -1), { ...currentTurn }];
                  } else {
                     return [...prev, { ...currentTurn }];
                  }
               });
             } catch (e) {
               console.error('[SessionFlow] JSON Parse Error:', e);
             }
          }
        }
      }
    } catch (error) {
      console.error('[SessionFlow] Streaming Error:', error);
    } finally {
      setIsStreaming(false);
    }
  }, [user, sessionId, activeMode, isStreaming]);

  const handleChoiceClick = (choice: any) => {
    if (choice.mode) {
      setActiveMode(choice.mode);
      if (choice.mode === 'calibration') setShowCalibrationForm(true);
    } else {
      handleSendMessage(choice.text, true);
    }
  };

  // 1b. Auto-Initiate from URL harvested thought
  useEffect(() => {
    if (messages.length === 0 && !isStreaming && user && !harvestedDone.current) {
       const harvestedThought = searchParams.get('thought');
       if (harvestedThought) {
          harvestedDone.current = true;
          handleSendMessage(harvestedThought, false, searchParams.get('mode') as any);
       } else if (messages.length === 0) {
          setMessages([INITIAL_MESSAGE]);
       }
    }
  }, [messages.length, isStreaming, user, searchParams, handleSendMessage]);

  const handleStitchComplete = async (selectedNodeIds: string[]) => {
    if (isStreaming || !user) return;
    
    const selectedNodes = lastAssistantMsg?.nodes?.filter((n: any) => selectedNodeIds.includes(n.id));
    const combinedText = selectedNodes?.map((n: any) => n.text).join(' → ');
    
    // Add to persistent map (simulated positions for now)
    const newStitch = {
        id: Math.random().toString(),
        points: selectedNodeIds.map((_, i) => ({ 
            x: 10 + Math.random() * 80, 
            y: 10 + Math.random() * 80 
        })),
        color: '#8b5cf6'
    };
    setPersistentStitches(prev => [...prev, newStitch]);
    
    handleSendMessage(combinedText || 'Neural synthesis complete', true);
    setView('reflection');
  };

  const profileName = user?.username || user?.firstName?.toLowerCase() || 'anonymous';

  const handleFeedbackComplete = async (feedbackData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      await fetch(`${apiUrl}/api/session/${sessionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      
      window.location.href = `/${profileName}`;
    } catch (err) {
      console.error('Feedback submission error:', err);
      window.location.href = '/';
    }
  };

  const handleAbort = () => {
    if (status === 'active') {
      setShowFeedback(true);
    } else {
      window.location.href = `/${profileName}`;
    }
  };

  const intensity = Math.min(1, 0.40 + (dnaScores.assumptionLoad * 0.45) + (dnaScores.emotionalSignal * 0.4));

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000000] text-slate-100 font-serif perspective-1000">
      
      <AnimatePresence>
        {showFeedback && (
          <ImpactAudit 
            sessionId={sessionId} 
            onComplete={handleFeedbackComplete} 
          />
        )}
      </AnimatePresence>

      {/* Background Layer: Mirror Orb - Shifted Asymmetrically (with Focus Blur) */}
      <div 
        className={`fixed inset-0 z-0 flex items-center lg:justify-end justify-center pointer-events-none lg:pr-[10vw] transition-all duration-1000 ${
          view === 'archeology' ? 'blur-[10px] opacity-20 scale-105' : (lastAssistantMsg || isStreaming) ? 'blur-[20px] opacity-40 scale-110' : 'blur-none opacity-100 scale-100'
        }`}
      >
        <div className="w-[80vw] h-[80vh] lg:w-[60vw] lg:h-[60vh]">
          <MirrorOrb 
            amplitude={amplitude} 
            assumptionLoad={dnaScores.assumptionLoad} 
            emotionalSignal={dnaScores.emotionalSignal} 
            isStreaming={isStreaming} 
            isRecording={isRecording}
            intensity={intensity}
            mode={activeMode}
          />
        </div>
      </div>

      {/* Foreground Layer: Immersive Editorial Overlays */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Top: Exit & Protocol */}
        <header className="w-full pt-12 px-12 xl:px-24 flex justify-between items-start pointer-events-none">
          <button 
            onClick={handleAbort}
            className="font-mono text-[9px] uppercase tracking-[0.6em] text-slate-600 hover:text-white transition-colors pointer-events-auto flex flex-col items-start gap-1"
          >
            <span>&larr; {status === 'active' ? 'Abort Protocol' : 'Neural Profile'}</span>
            {status === 'completed' && <span className="text-[7px] text-emerald-500/50 tracking-widest">READ ONLY ARCHIVE</span>}
          </button>
          
          <div className="flex items-center gap-8 pointer-events-auto">
             <button 
                onClick={() => setView(view === 'reflection' ? 'archeology' : 'reflection')}
                className="flex items-center gap-3 group px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all"
             >
                {view === 'reflection' ? <Layers size={14} className="text-emerald-400" /> : <MapIcon size={14} className="text-violet-400" />}
                <span className="font-mono text-[9px] text-slate-300 tracking-widest uppercase">
                    {view === 'reflection' ? 'Neural Archeology' : 'Surface View'}
                </span>
             </button>

             <button 
                onClick={() => setIsAnalysisOpen(true)}
                className="flex items-center gap-3 group px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
             >
                <Activity size={14} className="text-violet-400 group-hover:animate-pulse" />
                <span className="font-mono text-[9px] text-slate-400 group-hover:text-white tracking-widest uppercase">Pattern DNA</span>
             </button>
             <div className="flex flex-col items-end gap-1 opacity-40">
                <span className="font-mono text-[9px] text-violet-500 tracking-[0.4em]">MIRROR // V4.0</span>
                <span className="font-mono text-[8px] text-slate-600 tracking-widest">{sessionId.substring(0,8)}</span>
             </div>
          </div>
        </header>

        <CognitiveMap stitches={persistentStitches} />

        {/* Center: The Mirror's Voice or Feature UI */}
        <div className={`flex-1 w-full max-w-7xl mx-auto flex flex-col justify-start pt-[15vh] px-12 xl:px-24 pointer-events-none relative transition-all duration-700 ${view === 'archeology' ? 'opacity-10 blur-sm scale-95' : 'opacity-100 blur-none scale-100'}`}>
          <AnimatePresence mode="wait">
            {activeMode === 'calibration' ? (
              <motion.div 
                key="calibration-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pointer-events-auto flex flex-col items-center gap-8 w-full"
              >
                {!showCalibrationForm ? (
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-12">
                       <h2 className="text-4xl font-serif text-white">Calibration Engine</h2>
                       <button 
                         onClick={() => setShowCalibrationForm(true)}
                         className="px-6 py-3 rounded-full bg-indigo-500 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                       >
                         Log New Prediction
                       </button>
                    </div>
                    <CalibrationPortal userId={user?.id || ''} />
                  </div>
                ) : (
                  <CalibrationForm 
                    userId={user?.id || ''} 
                    onSuccess={() => {
                        setShowCalibrationForm(false);
                        handleSendMessage("I have committed a new prediction to the calibration engine. Let's analyze the assumptions behind it.");
                    }}
                    onCancel={() => setShowCalibrationForm(false)}
                  />
                )}
              </motion.div>
            ) : activeMode === 'patterns' ? (
              <motion.div 
                  key="patterns-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pointer-events-auto w-full"
              >
                  <h2 className="text-4xl font-serif text-white mb-8">Ambient Pattern Surfacing</h2>
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl lg:p-12">
                    <Zone2Patterns 
                      timeline={(snapshots || []).map(s => ({ 
                        date: s.snapshot_date, 
                        calibration: s.calibration_score, 
                        assumption: s.assumption_load, 
                        update: s.belief_update_count 
                      }))}
                      biases={(biasData?.length ?? 0) > 0 ? biasData : [{ name: 'General Reflection', count: 1 }]}
                    />
                  </div>
              </motion.div>
            ) : activeMode === 'reality' ? (
              <motion.div 
                key="reality-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center p-8 lg:p-24"
              >
                  <RealityLayerOverlay 
                    isInductionComplete={true}
                    onTensionClick={(tension) => {
                       setRealityTensionNode(tension);
                       handleSendMessage(`Resolve this reality tension: ${tension}`, true, 'reality');
                    }}
                  />
                  <div className={`relative z-10 text-center space-y-4 transition-all duration-700 ${messages.length > 1 ? 'translate-y-[-15vh]' : ''}`}>
                    <h2 className="text-5xl lg:text-7xl font-serif italic text-rose-400 tracking-tight">The Reality Layer</h2>
                    <p className="font-mono text-[10px] lg:text-[12px] tracking-[0.6em] text-white/40 uppercase">Mapping the tension between prediction and outcome.</p>
                  </div>
              </motion.div>
            ) : activeMode === 'synthesis' ? (
              <motion.div 
                key="synthesis-view"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto w-full h-[60vh] flex items-center justify-center"
              >
                  <MetacognitiveHorizon 
                    choices={lastAssistantMsg?.choices || []} 
                    nodes={lastAssistantMsg?.nodes || []}
                    onChoiceSelect={handleChoiceClick}
                  />
              </motion.div>
            ) : lastAssistantMsg?.reflection && (
              <motion.div 
                key={lastAssistantMsg.reflection}
                initial={{ opacity: 0, x: -50, filter: 'blur(20px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 50, filter: 'blur(20px)' }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 lg:space-y-10 max-w-4xl relative z-20"
              >
                {/* Anti-color Reflection text with Blur backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="backdrop-blur-xl bg-black/5 p-8 rounded-2xl border-l-[1px] border-white/5 shadow-2xl"
                >
                  <div className="flex flex-col">
                    <p className="font-serif text-xl lg:text-2xl italic leading-relaxed text-white mix-blend-difference selection:bg-violet-500/30">
                        {lastAssistantMsg?.reflection}
                    </p>
                    {lastAssistantMsg.realityContext && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-rose-400/60 font-bold"
                      >
                        <div className="w-1 h-1 bg-rose-500 rounded-full animate-ping" />
                        Reality Tension Detected: {lastAssistantMsg?.realityContext?.substring(0, 60)}...
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                
                    {lastAssistantMsg?.question && (
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                        className="text-4xl lg:text-6xl font-serif text-white mix-blend-difference leading-tight tracking-tight drop-shadow-2xl"
                      >
                        {lastAssistantMsg.question}
                      </motion.h1>
                    )}

                    {/* Inject 4 Features after first message or if specific choices exist */}
                    {(lastAssistantMsg?.choices || turnCount === 1) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="pt-8 w-full max-w-4xl"
                      >
                        <ChoiceCards 
                          choices={lastAssistantMsg?.choices || [
                            { text: "Analyze Cognitive Patterns", id: "analyze", mode: "patterns", description: "Visualize the recursive stars of your thinking." },
                            { text: "Identify Bias Assumptions", id: "identify", mode: "calibration", description: "Weight the confidence of your internal narratives." },
                            { text: "Reality Logic Check", id: "reality", mode: "reality", description: "Map the tension between intent and objective outcome." },
                            { text: "Frame Synthesis Options", id: "synthesis", mode: "synthesis", description: "Merge fragmented perspectives into a unified vision." }
                          ]} 
                          onChoiceSelect={handleChoiceClick}
                        />
                      </motion.div>
                    )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3D Orbiting Thought Field */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden perspective-[1000px]">
           <AnimatePresence>
            {(messages || []).filter((m: any) => m.role === 'user').slice(-6).map((msg, idx) => {
                const isRecent = idx >= 4; // Highlight last 2 messages
                return (
                  <motion.div
                    key={`${idx}-${msg.content.substring(0,10)}`}
                    initial={{ opacity: 0, z: -500 }}
                    animate={{ 
                      opacity: isRecent ? [0, 0.4, 0] : [0, 0.1, 0], 
                      z: [500, -500],
                      x: `${Math.sin(idx * 2) * 40}vw`,
                      y: `${Math.cos(idx * 2) * 40}vh`
                    }}
                    transition={{ 
                      duration: 30 + Math.random() * 20, 
                      repeat: Infinity,
                      delay: -(Math.random() * 20) 
                    }}
                    className="absolute left-1/2 top-1/2 font-serif italic whitespace-nowrap"
                    style={{ 
                      color: isRecent ? '#a78bfa' : 'white', 
                      fontSize: isRecent ? '1rem' : '0.75rem',
                      textShadow: isRecent ? '0 0 20px rgba(167,139,250,0.5)' : 'none'
                    }}
                  >
                    {msg.content.length > 80 ? msg.content.substring(0, 80) + '...' : msg.content}
                  </motion.div>
                );
              })}
           </AnimatePresence>
        </div>

        {/* Choice Overlay: Neural Constellation */}
        <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-end p-12 xl:p-24 pb-36">
           <AnimatePresence>
              {(lastAssistantMsg?.nodes || lastAssistantMsg?.choices) && view === 'archeology' && (
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="pointer-events-auto"
                >
                    <StitchCanvas 
                        nodes={[
                            ...(lastAssistantMsg?.nodes || (lastAssistantMsg?.choices || []).map((c: any) => ({ 
                                id: c.id, 
                                text: c.text, 
                                type: 'lens', 
                                resonance: 0.5, 
                                energyCost: 20 
                            })) || []),
                            ...(lastAssistantMsg?.realityContext ? [{
                                id: 'reality-tension',
                                text: lastAssistantMsg.realityContext,
                                type: 'contradiction',
                                resonance: 1.0,
                                energyCost: 0
                            }] : [])
                        ]}
                        energy={energy}
                        onComplete={handleStitchComplete}
                    />
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Bottom: Minimalist Aural Slice Input & Synthesis Nudge */}
        <div className="w-full flex flex-col items-center pb-12 px-12 xl:px-24 z-40 relative pointer-events-none">
          
          <AnimatePresence>
            {turnCount >= MAX_TURNS && status === 'active' && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8 flex flex-col items-center gap-4 pointer-events-auto"
              >
                <div className="px-6 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md flex items-center gap-3">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-200 font-bold">Neural Synthesis Recommended</span>
                </div>
                
                <button
                  onClick={handleAbort}
                  className="group relative px-12 py-4 prism-glass prism-edge-violet rounded-full overflow-hidden transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                >
                  <div className="absolute inset-0 bg-violet-600/20 group-hover:bg-violet-600/40 transition-colors" />
                  <span className="relative z-10 font-mono text-[10px] uppercase tracking-[0.5em] text-white">Finalize & Archive</span>
                </button>

                <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mt-2">
                  Patterns calibrated. Ready for integration.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full max-w-4xl pointer-events-auto relative">
            {/* Turn Progress Indicator (Neural Density) */}
            {status === 'active' && (
               <div className="absolute -top-4 left-0 w-full h-[1px] bg-white/5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-violet-500/40"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(turnCount / MAX_TURNS) * 100}%` }}
                  />
               </div>
            )}

            <InputField 
              value={userInput}
              onChange={setUserInput}
              onSend={() => {
                handleSendMessage(userInput);
                setUserInput('');
              }} 
              isDisabled={isStreaming || status === 'completed'}
              voiceState={{ isRecording, isTranscribing, toggleRecording }} 
              amplitude={amplitude}
            />
          </div>
        </div>

         <AnalysisPanel 
            isOpen={isAnalysisOpen}
            onClose={() => setIsAnalysisOpen(false)}
            dna={dnaScores}
            patterns={(messages || []).filter((m: any) => m.metadata?.patternDetected || m.patternDetected).map((m: any) => m.metadata?.patternDetected || (m.patternDetected?.name || m.patternDetected))}
            rationale={lastAssistantMsg?.thinkingRationale}
         />

      </div>
    </div>
  );
};
