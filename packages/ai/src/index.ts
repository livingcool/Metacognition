import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import type { MirrorResponse, ContextPackage, Message, CognitiveProfile, DNAScore } from '@mirror/types';
import { supabase, supabaseAdmin } from '@mirror/db';

/**
 * MirrorAI — Core Orchestration Engine (Gemini Pivot)
 */
export class MirrorAI {
  private executionModel!: ChatGoogleGenerativeAI;
  private reasoningModel!: ChatGoogleGenerativeAI;
  private embeddings!: GoogleGenerativeAIEmbeddings;

  constructor() {
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
        modelName: 'gemini-embedding-2-preview',
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
    const prompt = `
    Analyze this user input within the context of their cognitive profile and last turns.
    
    User Input: "${context.input}"
    Profile Patterns: ${JSON.stringify(context.profile?.dominant_patterns || [])}
    Last 3 Turns: ${JSON.stringify(context.lastThreeTurns)}

    Task:
    1. Detect the most active cognitive pattern (from research categories or new).
    2. Analyze the user's current thinking state across 6 axes (0-100):
       - Curiosity: Seeking alternatives vs confirming beliefs.
       - Analytical Depth: Reasoning depth vs surface deciding.
       - Skepticism: Questioning premises without prompting.
       - Reflective Tendency: Revisit past vs always moving forward.
       - Openness: Updating beliefs based on new session info.
       - Decisiveness: Acting with confidence under uncertainty.
    3. Generate 2 baseline DNA scores (0-100):
       - Assumption Load: Reliance on unstated premises.
       - Emotional Signal: Strength of feelings/biological markers.
    4. Detect if the user is making a measurable prediction or decision (predicted_confidence, assumptions).

    Return ONLY JSON:
    {
      "pattern": "Name",
      "scores": { 
        "curiosity": 50, "analyticalDepth": 50, "skepticism": 50, 
        "reflectiveTendency": 50, "openness": 50, "decisiveness": 50,
        "assumptionLoad": 50, "emotionalSignal": 50 
      },
      "isChoice": true/false,
      "detectedDecision": { "description": "...", "confidence": 85, "assumptions": ["...", "..."] } | null
    }`;

    const res = await this.executionModel.invoke(prompt);
    try {
      const cleanJson = res.content.toString().replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        pattern: 'General Reflection',
        scores: { 
          curiosity: 50, analyticalDepth: 50, skepticism: 50, 
          reflectiveTendency: 50, openness: 50, decisiveness: 50,
          assumptionLoad: 50, emotionalSignal: 50 
        },
        isChoice: false,
        detectedDecision: null
      };
    }

  }

  /**
   * Reflect on a session turn (SSE Stream)
   */
  async *reflect(context: ContextPackage): AsyncGenerator<Partial<MirrorResponse>> {
    console.log(`[MirrorAI] Reflecting for session ${context.sessionId}...`);

    // 1. Parallel RAG Retrieval (Inlined for stability)
    const { researchContext, historyContext } = await this.searchParallel(context.userId, context.input);

    // 2. Orchestration Decision (Layer 2)
    const decision = await this.orchestrate(context);

    // Yield Pattern Info (Instant)
    yield {
      patternDetected: {
        name: decision.pattern,
        citation: 'Mirror Cognitive Engine (2024)',
        description: `Detected potential ${decision.pattern} pattern in your current reasoning.`
      }
    };

    // Yield DNA Scores (Calculated)
    yield { dnaScores: decision.scores };

    // New: If a decision/prediction is detected, log it to the archaeology table
    if (decision.detectedDecision && supabaseAdmin) {
      await supabaseAdmin.from('decisions').insert({
        user_id: context.userId,
        session_id: context.sessionId,
        description: decision.detectedDecision.description,
        predicted_confidence: decision.detectedDecision.confidence,
        assumptions: decision.detectedDecision.assumptions,
        status: 'pending'
      });
    }



    // 3. Final Reflection (Layer 4/5)
    const choiceContext = context.isChoiceReply ? `The user has explicitly selected to explore through a specific thinking lens. Acknowledge this choice and deepen the inquiry through that lens.` : '';

    const prompt = `
    You are Mirror, a metacognitive mirror. 
    User Input: "${context.input}"
    
    Context:
    ${choiceContext}
    Research Context: ${researchContext.substring(0, 500)}
    History Context: ${historyContext.substring(0, 500)}
    Profile State: ${JSON.stringify(context.profile?.dominant_patterns || [])}

    Constraint: Speak in the second person. Be concise. Focus on the internal logic of the user, not just the content.
    Provide a reflection and a single follow-up question. 
    
    Also suggest 3 interactive choices. Each choice MUST move the conversation FORWARD based on the current turn.
    - active: 'logos' (Logic/Evidence)
    - active: 'pathos' (Emotion/Sensation)
    - active: 'metanoia' (Perspective Shift)
    - active: 'mythos' (Metaphor/Symbol)
    - active: 'synthesis' (Integration)

    Task:
    1. Reflection: Mirror the user's thought process back to them.
    2. Question: One short, powerful question to induce deeper thinking.
    3. Choices: 3 paths with different 'modes'. Ensure they are fresh and context-aware.
    4. Rationale: Briefly explain why you chose these specific paths for this specific input.

    Format output as JSON:
    {
      "reflection": "...",
      "question": "...",
      "choices": [{"id": "a", "text": "...", "mode": "..."}, ...],
      "thinkingRationale": "I'm offering these paths because..."
    }`;


    const response = await this.executionModel.invoke(prompt);
    try {
      const cleanJson = response.content.toString().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      yield parsed;
    } catch (e) {
      yield { reflection: response.content.toString(), question: "What leads you to that conclusion?", choices: [] };
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
    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('role, content, metadata')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!messages || messages.length === 0) return;

    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');

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
    await supabaseAdmin.from('session_chunks').insert({
      user_id: userId,
      session_id: sessionId,
      content: summaryData.summary,
      embedding: embedding
    });

    // 4. Bayesian Profile Update (10% Decay Logic)
    const { data: profile } = await supabaseAdmin
      .from('cognitive_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile) {
      const currentPatterns = profile.dominant_patterns || [];
      const sessionPatterns = summaryData.patterns || [];

      // Decay all current patterns by 10%
      let updatedPatterns = currentPatterns.map((p: any) => ({
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

      await supabaseAdmin
        .from('cognitive_profiles')
        .update({
          dominant_patterns: updatedPatterns,
          belief_update_rate: profile.belief_update_rate + (updateData.beliefUpdate ? 1 : 0),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // 5. Create Daily Snapshot Entry
      const date = new Date().toISOString().split('T')[0];
      const avgScores = messages.reduce((acc: any, m: any) => {
        if (m.metadata?.dnaScores) {
          Object.entries(m.metadata.dnaScores).forEach(([k, v]: [string, any]) => {
            acc[k] = (acc[k] || 0) + v;
          });
        }
        return acc;
      }, {});
      
      const count = messages.filter(m => m.metadata?.dnaScores).length || 1;
      const radarData = Object.entries(avgScores).reduce((acc: any, [k, v]: [string, any]) => {
        if (['curiosity', 'analyticalDepth', 'skepticism', 'reflectiveTendency', 'openness', 'decisiveness'].includes(k)) {
          acc[k] = Math.round(v / count);
        }
        return acc;
      }, {});

      const assumptionLoad = Math.round((avgScores.assumptionLoad || 0) / count);

      await supabaseAdmin.from('daily_cognitive_snapshots').upsert({
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
