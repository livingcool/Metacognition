import type { MirrorResponse, ContextPackage } from '@mirror/types';
import { QUESTION_ARCHETYPES } from '../prompts/logic_patterns.js';
import { invokeWithFailover, orchestrate } from './orchestrator.js';
import { searchResearch, searchUserHistory } from './retrieval.js';
import { RealityLayer } from '../rag/reality.js';
import { supabaseAdmin } from '@mirror/db';
import type { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export async function* reflect(
  context: ContextPackage, 
  embeddings: GoogleGenerativeAIEmbeddings,
  reality: RealityLayer
): AsyncGenerator<Partial<MirrorResponse>> {
  console.log(`[MirrorAI] Reflecting for session ${context.sessionId}...`);

  const decisionData = await orchestrate(context);
  
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

  const auditText = decisionData.audit?.detectedFlaw || 'Clear logic';
  const archetype = decisionData.audit?.archetype || 'mirror';
  const activePattern = decisionData.pattern || 'General Reflection';

  const targetedAssumption = decisionData.audit?.targetedAssumption || context.input;
  
  const [research, history, realityTension] = await Promise.all([
    searchResearch(embeddings, `${activePattern}: ${context.input}`, 5),
    searchUserHistory(embeddings, context.userId, `${activePattern}: ${context.input}`, 3),
    reality.surfaceTension(targetedAssumption)
  ]);

  const researchContext = research.length > 0
    ? `<research>\n${research.map((c: any) => `[${c.author}, ${c.year}]: ${c.content}`).join('\n---\n')}\n</research>`
    : '';

  const historyContext = history.length > 0
    ? `<history>\n${history.map((c: any) => `[Previous Context]: ${c.content}`).join('\n---\n')}\n</history>`
    : '';

  const template = QUESTION_ARCHETYPES[archetype as keyof typeof QUESTION_ARCHETYPES];
  const rawQuestion = template.template[Math.floor(Math.random() * template.template.length)];
  const personalizedQuestion = rawQuestion.replace(/{assumption}|{ambiguity}|{emotion}/g, targetedAssumption);

  const prompt = `
  You are Mirror, a high-fidelity metacognitive interface. Follow these 4 steps:
  1. ANALYSE: Logic audit found: "${auditText}"
  2. IDENTIFY: Primary pattern is "${activePattern}".
  3. RAG CONTEXT: 
     - Research: ${researchContext}
     - History: ${historyContext}
     - REALITY (Tension): ${realityTension}
  4. FRAME OPTIONS: reflection + 3 choices.

  CONSTRAINTS:
  - Respond in second person. Concisely, evocatively.
  - MODES: logos, pathos, metanoia.
  - NEURAL NODES: 4-6 thought fragments.
  - REALITY TENSION: Weave a subtle contradiction if context exists.
  - TONE: Conversational, plain English.

  OUTPUT FORMAT (JSON ONLY):
  {
    "reflection": "...",
    "question": "${personalizedQuestion}",
    "choices": [{"id": "a", "text": "...", "mode": "logos"}, ...],
    "nodes": [{"id": "n1", "text": "...", "type": "belief", "resonance": 0.8}, ...],
    "thinkingRationale": "Rationale..."
  }`;

  const response = await invokeWithFailover(prompt, { temperature: 0.1 });
  try {
    const cleanJson = response.content.toString().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    yield parsed;
  } catch (e) {
    console.error('[MirrorAI] Parsing failed. Falling back.');
    yield { 
      reflection: response.content.toString().substring(0, 500), 
      question: personalizedQuestion,
      dnaScores: decisionData.scores 
    };
  }
}
