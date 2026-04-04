import { z } from "zod";

/**
 * Mirror — Core Type Definitions
 * Shared across @mirror/api, @mirror/web, @mirror/ai, and @mirror/db
 */

// 1. Database Entities
export interface User {
  id: string; // Clerk User ID
  email: string;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface DNAScore {
  curiosity: number;
  analyticalDepth: number;
  skepticism: number;
  reflectiveTendency: number;
  openness: number;
  decisiveness: number;
  assumptionLoad: number;
  emotionalSignal: number;
  timestamp: string;
}

export interface Decision {
  id: string;
  user_id: string;
  session_id?: string;
  description: string;
  predicted_confidence: number;
  assumptions: string[];
  outcome_note?: string;
  actual_outcome_binary?: boolean;
  actual_outcome?: string; // New field for descriptive outcome
  calibration_gap?: number;
  calibration_error?: number; // New field for error calculation
  status: "pending" | "resolved";
  created_at: string;
  resolved_at?: string;
}

export interface CognitiveProfile {
  user_id: string;
  dominant_patterns: string[];
  dna_history: DNAScore[];
  weekly_insight?: string;
  calibration_score?: number;
  belief_update_rate?: number;
  radar_data?: Omit<
    DNAScore,
    "timestamp" | "assumptionLoad" | "emotionalSignal"
  >;
  updated_at: string;
}

// 2. AI & Session Entities
export interface Session {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  ended_at?: string;
  status: "active" | "completed" | "archived";
  preview?: string; // High-level snippet for gallery view
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  patternDetected?: string;
  citation?: string;
  dnaScores?: DNAScore;
}

// 3. RAG & Research
export interface ResearchChunk {
  id: string;
  filename: string;
  content: string;
  embedding: number[];
  author: string;
  year: number;
  bias_categories: string[];
}

export interface ChoiceCard {
  id: string;
  text: string;
  mode: "logos" | "pathos" | "metanoia" | "mythos" | "synthesis";
}

/**
 * STITCH NODE
 * A single 'thought piece' in the Neural Constellation.
 */
export interface StitchNode {
  id: string;
  text: string;
  type: "anchor" | "volatile" | "lens" | "contradiction" | "belief";
  resonance: number; // 0-1, visual intensity
  energyCost: number; // Cost to connect
  metadata?: {
    originalQuote?: string; // If pulled from user history
    citation?: string; // If pulled from RAG
    vectorSource?: string;
  };
}

export interface MirrorResponse {
  patternDetected?: {
    name: string;
    citation: string;
    description: string;
  };
  dnaScores?: Omit<DNAScore, "timestamp">;
  reflection?: string;
  question?: string;
  choices?: ChoiceCard[]; // Deprecating slowly
  nodes?: StitchNode[]; // NEW: For the Neural Archeology game
  realityContext?: string; // NEW: For the Reality Layer tension
  thinkingRationale?: string;
}

export interface ContextPackage {
  input: string;
  sessionId: string;
  userId: string;
  module: "canvas" | "xray" | "devils_advocate";
  profile: CognitiveProfile;
  lastThreeTurns: Message[];
  isChoiceReply: boolean;
  choiceSelected?: ChoiceCard;
  timestamp: string;
}

// Zod Schemas for Runtime Validation
export const DNAScoreSchema = z.object({
  curiosity: z.number().min(0).max(100),
  analyticalDepth: z.number().min(0).max(100),
  skepticism: z.number().min(0).max(100),
  reflectiveTendency: z.number().min(0).max(100),
  openness: z.number().min(0).max(100),
  decisiveness: z.number().min(0).max(100),
  assumptionLoad: z.number().min(0).max(100),
  emotionalSignal: z.number().min(0).max(100),
  timestamp: z.string().optional(),
});

export const ChoiceCardSchema = z.object({
  id: z.string(),
  text: z.string(),
  mode: z.enum(["logos", "pathos", "metanoia", "mythos", "synthesis"]),
});

export const StitchNodeSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["anchor", "volatile", "lens", "contradiction", "belief"]),
  resonance: z.number().min(0).max(1),
  energyCost: z.number().min(0),
  metadata: z
    .object({
      originalQuote: z.string().optional(),
      citation: z.string().optional(),
      vectorSource: z.string().optional(),
    })
    .optional(),
});

export const MirrorResponseSchema = z.object({
  patternDetected: z
    .object({
      name: z.string(),
      citation: z.string(),
      description: z.string(),
    })
    .optional(),
  dnaScores: DNAScoreSchema.omit({ timestamp: true }).optional(),
  reflection: z.string().optional(),
  question: z.string().optional(),
  choices: z.array(ChoiceCardSchema).optional(),
  nodes: z.array(StitchNodeSchema).optional(),
  realityContext: z.string().optional(),
  thinkingRationale: z.string().optional(),
});

export const OrchestrationResultSchema = z.object({
  pattern: z.string(),
  scores: DNAScoreSchema.omit({ timestamp: true }),
  isChoice: z.boolean(),
  prediction: z.object({
    detected: z.boolean(),
    confidence: z.number(),
    assumptions: z.array(z.string()),
  }),
  audit: z.object({
    detectedFlaw: z.string(),
    archetype: z.string(),
    targetedAssumption: z.string(),
  }),
});

export function validateMirrorResponse(data: unknown): MirrorResponse {
  return MirrorResponseSchema.parse(data);
}

export function safeParseJSON<T>(
  jsonString: string,
  schema: z.ZodSchema<T>,
): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return schema.parse(parsed);
  } catch (e) {
    console.error("[Zod] Validation failed:", e);
    return null;
  }
}
