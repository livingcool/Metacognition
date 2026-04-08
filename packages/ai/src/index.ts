import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import type { MirrorResponse, ContextPackage, Message, CognitiveProfile, DNAScore } from '@mirror/types';
import { supabase, supabaseAdmin } from '@mirror/db';
import { QUESTION_ARCHETYPES, SOCRATIC_SYSTEM_PROMPT } from './prompts/logic_patterns.js';
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
        model: 'gemini-2.5-flash', 
        temperature: 0,
      });

      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey || 'dummy-key-to-prevent-crash',
        modelName: 'text-embedding-004',
        // @ts-ignore
        outputDimensionality: 1536,
      });
    } catch (e: any) {
      console.error('❌ AI: Failed to initialize LangChain models:', e.message);
    }
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

    Return ONLY JSON:
    {
      "pattern": "Name",
      "scores": { "assumptionLoad": 0, "emotionalSignal": 0, "evidenceCited": 0, "alternativesConsidered": 0, "uncertaintyTolerance": 0 },
      "isChoice": true/false
    }`;

    // Parallel logic audit (Layer 3 Reasoning)
    const auditPrompt = `${SOCRATIC_SYSTEM_PROMPT}\n\nUser Input: "${context.input}"`;

    const [flashRes, auditRes] = await Promise.all([
      this.executionModel.invoke(flashPrompt),
      this.reasoningModel.invoke(auditPrompt)
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
        audit: { detectedFlaw: 'vague reasoning', archetype: 'mirror', targetedAssumption: context.input }
      };
    }
  }

  /**
   * Reflect on a session turn (SSE Stream)
   */
  async *reflect(context: ContextPackage): AsyncGenerator<Partial<MirrorResponse>> {
    console.log(`[MirrorAI] Reflecting for session ${context.sessionId}...`);

    // New: If a decision/prediction is detected, log it to the archaeology table
    const decision = await this.orchestrate(context);
    if (decision.isChoice && supabaseAdmin) {
      await (supabaseAdmin.from('decisions') as any).insert({
        user_id: context.userId,
        session_id: context.sessionId,
        description: context.input,
        status: 'pending'
      });
    }

    /**
     * 1. Analyse User Question (Logic Audit, Ambiguity, Assumptions)
     */
    const auditText = decision.audit?.detectedFlaw || 'Clear logic';
    const archetype = decision.audit?.archetype || 'mirror';

    /**
     * 2. Identify Patterns (DNA Scores, Cognitive Patterns)
     */
    const activePattern = decision.pattern || 'General Reflection';
    const dnaStatus = decision.scores || { assumptionLoad: 50, emotionalSignal: 50 };

    /**
     * 3. Check RAG for Similar Patterns (Research + History)
     */
    const { researchContext, historyContext } = await this.searchParallel(context.userId, `${activePattern}: ${context.input}`);

    /**
     * 4. Frame Options (Interactive Choices + Final Reflection)
     */
    const template = QUESTION_ARCHETYPES[archetype as keyof typeof QUESTION_ARCHETYPES];
    const rawQuestion = template.template[Math.floor(Math.random() * template.template.length)];
    const targetedArg = decision.audit?.targetedAssumption || context.input;
    const personalizedQuestion = rawQuestion.replace(/{assumption}|{ambiguity}|{emotion}/g, targetedArg);

    const prompt = `
    You are Mirror, a high-fidelity metacognitive interface. Follow these 4 steps to generate your response:
    1. ANALYSE: The logic audit found: "${auditText}"
    2. IDENTIFY: The primary pattern is "${activePattern}".
    3. RAG CONTEXT: 
       - Research: ${researchContext}
       - History: ${historyContext}
    4. FRAME OPTIONS: Based on the above, provide a reflection and 3 interactive choices.

    CONSTRAINTS:
    - Respond in the second person. Be concise, yet evocative.
    - MODES: One choice must be 'logos' (logic), one 'pathos' (emotion), and one 'metanoia' (mindshift).
    - NEURAL NODES: Suggest 4-6 "thought fragments" based on the RAG context and patterns detected.
    - TONE: Conversational and plain English. Avoid jargon.

    OUTPUT FORMAT (JSON ONLY):
    {
      "reflection": "...",
      "question": "${personalizedQuestion}",
      "choices": [{"id": "a", "text": "...", "mode": "logos"}, ...],
      "nodes": [{"id": "n1", "text": "...", "type": "belief", "resonance": 0.8}, ...],
      "thinkingRationale": "Briefly explain why these options were framed this way."
    }`;

    const response = await this.executionModel.invoke(prompt);
    try {
      const cleanJson = response.content.toString().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      yield parsed;
    } catch (e) {
      console.error('[MirrorAI] Parsing failed. Falling back to structured response.');
      yield { 
        reflection: response.content.toString().substring(0, 500), 
        question: personalizedQuestion,
        dnaScores: decision.scores 
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

    const summaryRes = await this.executionModel.invoke(summaryPrompt);
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

    // 4. Bayesian Profile Update (10% Decay Logic)
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
      const updateRes = await this.executionModel.invoke(updatePrompt);
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

  async searchParallel(userId: string, query: string) {
    const [research, history] = await Promise.all([
      this.searchResearch(query, 5),
      this.searchUserHistory(userId, query, 3)
    ]);

    const researchContext = research.length > 0
      ? `<research>\n${research.map((c: any) => `[${c.author}, ${c.year}]: ${c.content}`).join('\n---\n')}\n</research>`
      : '';

    const historyContext = history.length > 0
      ? `<history>\n${history.map((c: any) => `[Previous Context]: ${c.content}`).join('\n---\n')}\n</history>`
      : '';

    return { researchContext, historyContext };
  }
}

export const mirrorAI = new MirrorAI();
