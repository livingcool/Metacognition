import { describe, it, expect } from "vitest";
import { z } from "zod";

const DNAScoreSchema = z.object({
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

const MirrorResponseSchema = z.object({
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
  choices: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        mode: z.enum(["logos", "pathos", "metanoia", "mythos", "synthesis"]),
      }),
    )
    .optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        type: z.enum(["anchor", "volatile", "lens", "contradiction", "belief"]),
        resonance: z.number().min(0).max(1),
        energyCost: z.number().min(0),
      }),
    )
    .optional(),
  realityContext: z.string().optional(),
  thinkingRationale: z.string().optional(),
});

describe("Zod Schema Validation", () => {
  describe("DNAScoreSchema", () => {
    it("should validate a valid DNA score", () => {
      const validScore = {
        curiosity: 85,
        analyticalDepth: 60,
        skepticism: 40,
        reflectiveTendency: 70,
        openness: 90,
        decisiveness: 30,
        assumptionLoad: 50,
        emotionalSignal: 65,
      };

      expect(() => DNAScoreSchema.parse(validScore)).not.toThrow();
    });

    it("should reject DNA score out of range", () => {
      const invalidScore = {
        curiosity: 150,
        analyticalDepth: 60,
        skepticism: 40,
        reflectiveTendency: 70,
        openness: 90,
        decisiveness: 30,
        assumptionLoad: 50,
        emotionalSignal: 65,
      };

      expect(() => DNAScoreSchema.parse(invalidScore)).toThrow();
    });
  });

  describe("MirrorResponseSchema", () => {
    it("should validate a complete mirror response", () => {
      const validResponse = {
        reflection: "You are demonstrating high curiosity.",
        question: "What assumptions are you making?",
        choices: [
          { id: "a", text: "Analyze logically", mode: "logos" },
          { id: "b", text: "Consider emotionally", mode: "pathos" },
        ],
        dnaScores: {
          curiosity: 85,
          analyticalDepth: 60,
          skepticism: 40,
          reflectiveTendency: 70,
          openness: 90,
          decisiveness: 30,
          assumptionLoad: 50,
          emotionalSignal: 65,
        },
      };

      expect(() => MirrorResponseSchema.parse(validResponse)).not.toThrow();
    });

    it("should validate a partial mirror response", () => {
      const partialResponse = {
        reflection: "You are thinking about this carefully.",
        question: "What else might be true?",
      };

      expect(() => MirrorResponseSchema.parse(partialResponse)).not.toThrow();
    });
  });
});
