import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import type { MirrorResponse, ContextPackage, Message, CognitiveProfile, DNAScore } from '@mirror/types';
import { supabase, supabaseAdmin } from '@mirror/db';
import { QUESTION_ARCHETYPES, SOCRATIC_SYSTEM_PROMPT } from './prompts/logic_patterns.js';
import { RealityLayer } from './rag/reality.js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MirrorAI — Core Orchestration Engine (Gemini Pivot)
 */
export class MirrorAI {
  private executionModel!: ChatGoogleGenerativeAI;
  private reasoningModel!: ChatGoogleGenerativeAI;
  private embeddings!: GoogleGenerativeAIEmbeddings;
  private reality!: RealityLayer;

  private MODEL_HIERARCHY = [
    'gemini-3.1-pro-preview',
    'gemini-2.5-pro',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
    'gemma-3-27b-it',
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ];

  constructor() {
    // Load .env from workspace root
    const envPath = path.resolve(__dirname, '../../../.env');
    dotenv.config({ path: envPath });

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('❌ AI: GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is missing in Vercel. AI features will fail.');
    } else {
      console.log(`[MirrorAI] Initializing with key: ${apiKey.substring(0, 5)}...`);
    }

    try {
      this.executionModel = new ChatGoogleGenerativeAI({
        apiKey: apiKey || 'dummy-key-to-prevent-crash',
        model: 'gemini-2.5-flash',
        temperature: 0.1,
      });

      this.reasoningModel = new ChatGoogleGenerativeAI({
        apiKey: apiKey || 'dummy-key-to-prevent-crash',
        model: 'gemini-2.5-flash', // Using thinking-enabled flash
        temperature: 0,
      });

      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey || 'dummy-key-to-prevent-crash',
        modelName: 'gemini-embedding-2-preview',
        // @ts-ignore
        outputDimensionality: 1536,
      });

      this.reality = new RealityLayer();
    } catch (e: any) {
      console.error('❌ AI: Failed to initialize LangChain models:', e.message);
    }
  }

  /**
   * Adaptive Failover Wrapper
   * Cycles through models if 429 (Rate Limit) is detected.
   */
  private async invokeWithFailover(prompt: string, options: { temperature?: number, useThinking?: boolean } = {}) {
    let lastError: any;
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    for (const model of this.MODEL_HIERARCHY) {
      try {
        console.log(`[MirrorAI] Attempting call with model: ${model}...`);
        const client = new ChatGoogleGenerativeAI({
          apiKey: apiKey || 'dummy-key',
          model: model,
          temperature: options.temperature ?? 0.1,
          // Only enable thinking for Gemini models that support it
          ...(options.useThinking && model.includes('gemini') ? { thinking: true } : {})
        });

        const res = await client.invoke(prompt);
        return res;
      } catch (err: any) {
        lastError = err;
        if (err.message?.includes('429') || err.status === 429) {
          console.warn(`⚠️ Rate limit hit on ${model}. Switching to next in hierarchy...`);
          continue;
        }
        throw err; // Re-throw other errors (500, Auth, etc.)
      }
    }
    throw new Error(`[MirrorAI] All reasoning models exhausted. Last error: ${lastError?.message}`);
  }

  /**
   * Layer 2: Orchestrator Decision
   * Decides routing, pattern detection, and DNA priors.
   */
  private async orchestrate(context: ContextPackage) {
    const flashPrompt = `
    Analyze this user input within the context of their cognitive profile and last turns.
    
    User Input: "${context.input}"
    Profile Patterns: ${JSON.stringify(context.profile?.dominant_patterns || [])}
    Last 3 Turns: ${JSON.stringify(context.lastThreeTurns)}

    Task:
    1. Detect the most active cognitive pattern (from research categories or new).
    2. Suggest 5 DNA scores (Assumption Load, Emotional Signal, Evidence Cited, Alternatives Consider, Uncertainty Tolerance) 0-100.
    3. Decide if this is a response to a previous choice (A/B/C/D).
    4. Detect if the user is making a PREDICTION or COMMITMENT (e.g., "I will X," "I bet Y will happen," "I'm choosing to Z").
    5. If a prediction is detected, estimate the user's PREDICTED CONFIDENCE (0-100) and extract 2-3 CORE ASSUMPTIONS supporting it.

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

    // Parallel logic audit (Layer 3 Reasoning)
    const auditPrompt = `${SOCRATIC_SYSTEM_PROMPT}\n\nUser Input: "${context.input}"`;

    const [flashRes, auditRes] = await Promise.all([
      this.invokeWithFailover(flashPrompt, { temperature: 0.1 }),
      this.invokeWithFailover(auditPrompt, { temperature: 0, useThinking: true })
    ]);

    try {
      const flashData = JSON.parse(flashRes.content.toString().replace(/```json|```/g, '').trim());
      const auditData = JSON.parse(auditRes.content.toString().replace(/```json|```/g, '').trim());

      return {
        ...flashData,
        audit: auditData
      };
    } catch (e) {
      console.error('[MirrorAI] Orchestration error:', e);
      return {
        pattern: 'General Reflection',
        scores: { assumptionLoad: 50, emotionalSignal: 50, evidenceCited: 50, alternativesConsidered: 50, uncertaintyTolerance: 50 },
        isChoice: false,
        prediction: { detected: false, confidence: 0, assumptions: [] },
        audit: { detectedFlaw: 'vague reasoning', archetype: 'mirror', targetedAssumption: context.input }
      };
    }
  }

  /**
   * Reflect on a session turn (SSE Stream)
   */
  async *reflect(context: ContextPackage): AsyncGenerator<Partial<MirrorResponse>> {
    console.log(`[MirrorAI] Reflecting for session ${context.sessionId}...`);

    // Calibration Engine: If a prediction/commitment is detected, log it to the archaeology table
    const decisionData = await this.orchestrate(context);
    if (decisionData.prediction?.detected && supabaseAdmin) {
      console.log(`[MirrorAI] Prediction detected: ${decisionData.prediction.confidence}% confidence`);
      await (supabaseAdmin.from('decisions') as any).insert({
        user_id: context.userId,
        session_id: context.sessionId,
        description: context.input,
        predicted_confidence: decisionData.prediction.confidence,
        assumptions: decisionData.prediction.assumptions,
        status: 'pending'
      });
    }

    /**
     * 1. Analyse User Question (Logic Audit, Ambiguity, Assumptions)
     */
    const auditText = decisionData.audit?.detectedFlaw || 'Clear logic';
    const archetype = decisionData.audit?.archetype || 'mirror';

    /**
     * 2. Identify Patterns (DNA Scores, Cognitive Patterns)
     */
    const activePattern = decisionData.pattern || 'General Reflection';
    const dnaStatus = decisionData.scores || { assumptionLoad: 50, emotionalSignal: 50 };

    /**
     * 3. Check RAG for Similar Patterns (Research + History + Reality)
     */
    const targetedAssumption = decisionData.audit?.targetedAssumption || context.input;
    const { researchContext, historyContext, realityContext } = await this.searchParallel(
        context.userId, 
        `${activePattern}: ${context.input}`,
        targetedAssumption
    );

    /**
     * 4. Frame Options (Interactive Choices + Final Reflection)
     */
    const template = QUESTION_ARCHETYPES[archetype as keyof typeof QUESTION_ARCHETYPES];
    const rawQuestion = template.template[Math.floor(Math.random() * template.template.length)];
    const targetedArg = decisionData.audit?.targetedAssumption || context.input;
    const personalizedQuestion = rawQuestion.replace(/{assumption}|{ambiguity}|{emotion}/g, targetedArg);

    const prompt = `
    You are Mirror, a high-fidelity metacognitive interface. Follow these 4 steps to generate your response:
    1. ANALYSE: The logic audit found: "${auditText}"
    2. IDENTIFY: The primary pattern is "${activePattern}".
    3. RAG CONTEXT: 
       - Research: ${researchContext}
       - History: ${historyContext}
       - REALITY (Tension): ${realityContext}
    4. FRAME OPTIONS: Based on the above, provide a reflection and 3 interactive choices.

    CONSTRAINTS:
    - Respond in the second person. Be concise, yet evocative.
    - MODES: One choice must be 'logos' (logic), one 'pathos' (emotion), and one 'metanoia' (mindshift).
    - NEURAL NODES: Suggest 4-6 "thought fragments" based on the RAG context and patterns detected.
    - REALITY TENSION: If 'realityContext' is not empty, weave a subtle contradiction into your reflection OR one of your choices.
    - TONE: Conversational and plain English. Avoid jargon.

    OUTPUT FORMAT (JSON ONLY):
    {
      "reflection": "...",
      "question": "${personalizedQuestion}",
      "choices": [{"id": "a", "text": "...", "mode": "logos"}, ...],
      "nodes": [{"id": "n1", "text": "...", "type": "belief", "resonance": 0.8}, ...],
      "thinkingRationale": "Briefly explain why these options were framed this way."
    }`;

    const response = await this.invokeWithFailover(prompt, { temperature: 0.1 });
    try {
      const cleanJson = response.content.toString().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      yield parsed;
    } catch (e) {
      console.error('[MirrorAI] Parsing failed. Falling back to structured response.');
      yield { 
        reflection: response.content.toString().substring(0, 500), 
        question: personalizedQuestion,
        dnaScores: decisionData.scores 
      };
    }
  }

  /**
   * Layer 6: Session Closure & Memory Write-back
   * Implements Bayesian update andStore B embedding.
   */
  async closeSession(userId: string, sessionId: string) {
    if (!supabaseAdmin) return;

    console.log(`[MirrorAI] Closing session ${sessionId} for memory persistence...`);

    // 1. Fetch entire session transcript
    const { data: messages } = await (supabaseAdmin
      .from('messages') as any)
      .select('role, content, metadata')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!messages || (messages as any[]).length === 0) return;

    const transcript = (messages as any[]).map((m: any) => `${m.role}: ${m.content}`).join('\n');

    // 2. Summarize session & detect patterns
    const summaryPrompt = `
    Summarize this session for long-term memory. 
    Identify which cognitive patterns were most prominent.
    Transcript:
    ${transcript}

    Return JSON: { "summary": "...", "patterns": ["Pattern1", "Pattern2"] }
    `;

    const summaryRes = await this.invokeWithFailover(summaryPrompt, { temperature: 0 });
    const summaryData = JSON.parse(summaryRes.content.toString().replace(/```json|```/g, '').trim());

    // 3. Update Store B (session_chunks)
    const rawEmbedding = await this.embeddings.embedQuery(summaryData.summary);
    const embedding = rawEmbedding.slice(0, 1536);
    await (supabaseAdmin.from('session_chunks') as any).insert({
      user_id: userId,
      session_id: sessionId,
      content: summaryData.summary,
      embedding: embedding
    });

    // 4. Update Longitudinal Snapshot (Phase 3)
    console.log(`[MirrorAI] Synching longitudinal patterns for user ${userId}...`);
    await this.analyzeLongitudinal(userId);

    // 5. Bayesian Profile Update (10% Decay Logic)
    const { data: profile } = await (supabaseAdmin
      .from('cognitive_profiles') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile) {
      const currentPatterns = profile.dominant_patterns || [];
      const sessionPatterns = summaryData.patterns || [];

      // Decay all current patterns by 10%
      let updatedPatterns = (currentPatterns as any[]).map((p: any) => ({
        ...p,
        resonance: p.resonance * 0.9
      }));

      // Upsert/Boost patterns from this session
      sessionPatterns.forEach((sp: string) => {
        const existing = updatedPatterns.find((p: any) => p.name === sp);
        if (existing) {
          existing.resonance = Math.min(1.0, existing.resonance + 0.2); // Boost by 20%
        } else {
          updatedPatterns.push({ name: sp, resonance: 0.5 }); // Initial resonance
        }
      });

      // Filter out very weak patterns (< 0.2)
      updatedPatterns = updatedPatterns.filter((p: any) => p.resonance > 0.2);

      // Detect Belief Updates (Was there a position shift?)
      const updatePrompt = `
      Compare the user's initial position in this session to their position at the end.
      Did they update their belief or change their mind?
      Transcript: ${transcript}
      Return JSON: { "beliefUpdate": true/false, "description": "..." }
      `;
      const updateRes = await this.invokeWithFailover(updatePrompt, { temperature: 0 });
      const updateData = JSON.parse(updateRes.content.toString().replace(/```json|```/g, '').trim());

      await (supabaseAdmin
        .from('cognitive_profiles') as any)
        .update({
          dominant_patterns: updatedPatterns,
          belief_update_rate: profile.belief_update_rate + (updateData.beliefUpdate ? 1 : 0),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // 5. Create Daily Snapshot Entry
      const date = new Date().toISOString().split('T')[0];
      const avgScores = (messages as any[]).reduce((acc: any, m: any) => {
        if (m.metadata?.dnaScores) {
          Object.entries(m.metadata.dnaScores).forEach(([k, v]: [string, any]) => {
            acc[k] = (acc[k] || 0) + v;
          });
        }
        return acc;
      }, {});
      
      const count = (messages as any[]).filter((m: any) => m.metadata?.dnaScores).length || 1;
      const radarData = Object.entries(avgScores).reduce((acc: any, [k, v]: [string, any]) => {
        if (['curiosity', 'analyticalDepth', 'skepticism', 'reflectiveTendency', 'openness', 'decisiveness'].includes(k)) {
          acc[k] = Math.round(v / count);
        }
        return acc;
      }, {});

      const assumptionLoad = Math.round((avgScores.assumptionLoad || 0) / count);

      await (supabaseAdmin.from('daily_cognitive_snapshots') as any).upsert({
        user_id: userId,
        snapshot_date: date,
        calibration_score: profile.calibration_score,
        assumption_load: assumptionLoad,
        belief_update_count: updateData.beliefUpdate ? 1 : 0,
        dominant_bias: sessionPatterns[0] || 'General Reflection',
        radar_data: radarData
      }, { onConflict: 'user_id, snapshot_date' });
    }

  }

  /**
   * INLINED RAG METHODS (Layer 3)
   * Resolves monorepo resolution issues by keeping retrieval core to the engine.
   */

  async searchResearch(query: string, limit: number = 3) {
    const rawVector = await this.embeddings.embedQuery(query);
    const vector = rawVector.slice(0, 1536);
    console.log(`[MirrorAI] Querying research with dimensions: ${vector.length}`);

    const { data: chunks, error } = await supabase.rpc('match_research_chunks', {
      query_embedding: vector,
      match_threshold: 0.5,
      match_count: limit,
    });

    if (error) {
      console.error('[MirrorAI] Error searching research:', error);
      return [];
    }

    return chunks || [];
  }

  async searchUserHistory(userId: string, query: string, limit: number = 3) {
    const rawVector = await this.embeddings.embedQuery(query);
    const vector = rawVector.slice(0, 1536);
    console.log(`[MirrorAI] Querying user history with dimensions: ${vector.length}`);

    const { data: chunks, error } = await supabase.rpc('match_session_chunks', {
      query_embedding: vector,
      match_threshold: 0.6,
      match_count: limit,
      p_user_id: userId
    });

    if (error) {
      console.error('[MirrorAI] Error searching user history:', error);
      return [];
    }

    return chunks || [];
  }

  /**
   * Phase 3: Macro-Analysis Engine
   * High-level synthesis of recent sessions and decisions.
   */
  async analyzeLongitudinal(userId: string) {
    if (!supabaseAdmin) return;

    // 1. Fetch data from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    try {
        const [sessions, decisions] = await Promise.all([
            (supabaseAdmin.from('session_chunks') as any).select('*').eq('user_id', userId).gte('created_at', sevenDaysAgo),
            (supabaseAdmin.from('decisions') as any).select('*').eq('user_id', userId).gte('created_at', sevenDaysAgo)
        ]);

        const context = `
        Recent Session Summaries:
        ${sessions.data?.map((s: any) => `- ${s.content}`).join('\n')}

        Recent Decisions & Commitments:
        ${decisions.data?.map((d: any) => `- ${d.description} (Confidence: ${d.predicted_confidence}%)`).join('\n')}
        `;

        const analyzePrompt = `
        Analyze these 7 days of thinking for user ${userId}.
        Identify the "Dominant Bias" from these categories: Confirmation Bias, Overconfidence, Urgency Compression, Sunk Cost, Availability, Authority Bias, None.
        Estimate overall "Assumption Load" (0-100) and "Calibration Accuracy" (0-100).
        Context:
        ${context}

        Return JSON: { "dominantBias": "...", "assumptionLoad": number, "calibrationScore": number, "updateRate": number }
        `;

        const res = await this.executionModel.invoke(analyzePrompt);
        const data = JSON.parse(res.content.toString().replace(/```json|```/g, '').trim());

        // 2. Populating Daily Snapshot (or update today's)
        const today = new Date().toISOString().split('T')[0];
        
        await (supabaseAdmin.from('daily_cognitive_snapshots') as any).upsert({
            user_id: userId,
            snapshot_date: today,
            calibration_score: data.calibrationScore,
            assumption_load: data.assumptionLoad,
            belief_update_count: data.updateRate || 0,
            dominant_bias: data.dominantBias,
            radar_data: { skepticism: 50, curiosity: 50 } // Basic for now
        }, { onConflict: 'user_id,snapshot_date' });

        // 3. Update main profile
        await (supabaseAdmin.from('cognitive_profiles') as any).update({
            dominant_patterns: [data.dominantBias],
            updated_at: new Date().toISOString()
        }).eq('user_id', userId);

    } catch (e) {
        console.error('[MirrorAI] Longitudinal Analysis failed:', e);
    }
  }

  async searchParallel(userId: string, query: string, assumption?: string) {
    const [research, history, reality] = await Promise.all([
      this.searchResearch(query, 5),
      this.searchUserHistory(userId, query, 3),
      this.reality.surfaceTension(assumption || query)
    ]);

    const researchContext = research.length > 0
      ? `<research>\n${research.map((c: any) => `[${c.author}, ${c.year}]: ${c.content}`).join('\n---\n')}\n</research>`
      : '';

    const historyContext = history.length > 0
      ? `<history>\n${history.map((c: any) => `[Previous Context]: ${c.content}`).join('\n---\n')}\n</history>`
      : '';

    return { 
        researchContext, 
        historyContext,
        realityContext: reality
    };
  }
}

export const mirrorAI = new MirrorAI();
