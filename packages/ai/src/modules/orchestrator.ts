import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { ContextPackage } from "@mirror/types";
import { SOCRATIC_SYSTEM_PROMPT } from "../prompts/logic_patterns.js";

function getRandomModel(models: string[]): string {
  return models[Math.floor(Math.random() * models.length)];
}

export const CHAT_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

export const REASONING_MODELS = ["gemini-2.5-pro", "gemini-1.5-pro"];

export const FAST_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemma-4-31b-it",
];

export const MODEL_HIERARCHY = [
  "gemini-2.5-pro",
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
  "gemma-3-27b-it",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

export type ModelPurpose = "chat" | "reasoning" | "fast";

export function getModelForPurpose(purpose: ModelPurpose): string {
  switch (purpose) {
    case "chat":
      return getRandomModel(CHAT_MODELS);
    case "reasoning":
      return getRandomModel(REASONING_MODELS);
    case "fast":
      return getRandomModel(FAST_MODELS);
  }
}

export async function invokeWithFailover(
  prompt: string,
  options: {
    temperature?: number;
    useThinking?: boolean;
    purpose?: ModelPurpose;
  } = {},
): Promise<any> {
  let lastError: any;
  const apiKey =
    process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  let modelsToTry: string[];
  if (options.purpose) {
    modelsToTry = [getModelForPurpose(options.purpose), ...MODEL_HIERARCHY];
  } else {
    modelsToTry = MODEL_HIERARCHY;
  }

  for (const model of modelsToTry) {
    try {
      console.log(`[MirrorAI] Attempting call with model: ${model}...`);
      const client = new ChatGoogleGenerativeAI({
        apiKey: apiKey || "dummy-key",
        model: model,
        temperature: options.temperature ?? 0.1,
        ...(options.useThinking && model.includes("gemini")
          ? { thinking: true }
          : {}),
      });

      const res = await client.invoke(prompt);
      return res;
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes("429") || err.status === 429) {
        console.warn(`⚠️ Rate limit hit on ${model}. Switching to next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error(
    `[MirrorAI] All reasoning models exhausted. Last error: ${lastError?.message}`,
  );
}

export async function orchestrate(context: ContextPackage) {
  const flashPrompt = `
  Analyze this user input within the context of their cognitive profile and last turns.
  
  User Input: "${context.input}"
  Profile Patterns: ${JSON.stringify(context.profile?.dominant_patterns || [])}
  Last 3 Turns: ${JSON.stringify(context.lastThreeTurns)}

  Task:
  1. Detect the most active cognitive pattern (from research categories or new).
  2. Suggest 5 DNA scores (Assumption Load, Emotional Signal, Evidence Cited, Alternatives Consider, Uncertainty Tolerance) 0-100.
  3. Decide if this is a response to a previous choice (A/B/C/D).
  4. Detect if the user is making a PREDICTION or COMMITMENT.
  5. Estimate predicted confidence and extract assumptions if a prediction is found.

  Return ONLY JSON:
  {
    "pattern": "Name",
    "scores": { "assumptionLoad": 0, "emotionalSignal": 0, "evidenceCited": 0, "alternativesConsidered": 0, "uncertaintyTolerance": 0 },
    "isChoice": true/false,
    "prediction": {
      "detected": true/false,
      "confidence": number,
      "assumptions": ["Assumption 1", "Assumption 2"]
    }
  }`;

  const auditPrompt = `${SOCRATIC_SYSTEM_PROMPT}\n\nUser Input: "${context.input}"`;

  const [flashRes, auditRes] = await Promise.all([
    invokeWithFailover(flashPrompt, { temperature: 0.1, purpose: "fast" }),
    invokeWithFailover(auditPrompt, {
      temperature: 0,
      useThinking: true,
      purpose: "reasoning",
    }),
  ]);

  try {
    const flashData = JSON.parse(
      flashRes.content
        .toString()
        .replace(/```json|```/g, "")
        .trim(),
    );
    const auditData = JSON.parse(
      auditRes.content
        .toString()
        .replace(/```json|```/g, "")
        .trim(),
    );

    return {
      ...flashData,
      audit: auditData,
    };
  } catch (e) {
    console.error("[MirrorAI] Orchestration error:", e);
    return {
      pattern: "General Reflection",
      scores: {
        assumptionLoad: 50,
        emotionalSignal: 50,
        evidenceCited: 50,
        alternativesConsidered: 50,
        uncertaintyTolerance: 50,
      },
      isChoice: false,
      prediction: { detected: false, confidence: 0, assumptions: [] },
      audit: {
        detectedFlaw: "vague reasoning",
        archetype: "mirror",
        targetedAssumption: context.input,
      },
    };
  }
}
