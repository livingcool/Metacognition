import { supabaseAdmin } from '@mirror/db';
import type { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { invokeWithFailover } from './orchestrator.js';

export async function closeSession(
  userId: string, 
  sessionId: string, 
  embeddings: GoogleGenerativeAIEmbeddings,
  executionModel: ChatGoogleGenerativeAI
) {
  if (!supabaseAdmin) return;

  console.log(`[MirrorAI] Closing session ${sessionId} for memory persistence...`);

  const { data: messages } = await (supabaseAdmin
    .from('messages') as any)
    .select('role, content, metadata')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (!messages || (messages as any[]).length === 0) return;

  const transcript = (messages as any[]).map((m: any) => `${m.role}: ${m.content}`).join('\n');

  const summaryPrompt = `
  Summarize this session for long-term memory. 
  Identify which cognitive patterns were most prominent.
  Transcript:
  ${transcript}

  Return JSON: { "summary": "...", "patterns": ["Pattern1", "Pattern2"] }
  `;

  const summaryRes = await invokeWithFailover(summaryPrompt, { temperature: 0 });
  const summaryData = JSON.parse(summaryRes.content.toString().replace(/```json|```/g, '').trim());

  const rawEmbedding = await embeddings.embedQuery(summaryData.summary);
  const embedding = rawEmbedding.slice(0, 1536);
  await (supabaseAdmin.from('session_chunks') as any).insert({
    user_id: userId,
    session_id: sessionId,
    content: summaryData.summary,
    embedding: embedding
  });

  const { data: profile } = await (supabaseAdmin
    .from('cognitive_profiles') as any)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profile) {
    const currentPatterns = profile.dominant_patterns || [];
    const sessionPatterns = summaryData.patterns || [];

    let updatedPatterns = (currentPatterns as any[]).map((p: any) => ({
      ...p,
      resonance: p.resonance * 0.9
    }));

    sessionPatterns.forEach((sp: string) => {
      const existing = updatedPatterns.find((p: any) => p.name === sp);
      if (existing) {
        existing.resonance = Math.min(1.0, existing.resonance + 0.2);
      } else {
        updatedPatterns.push({ name: sp, resonance: 0.5 });
      }
    });

    updatedPatterns = updatedPatterns.filter((p: any) => p.resonance > 0.2);

    const updatePrompt = `
    Compare initial position to end position. Did belief update occur?
    Transcript: ${transcript}
    Return JSON: { "beliefUpdate": true/false, "description": "..." }
    `;
    const updateRes = await invokeWithFailover(updatePrompt, { temperature: 0 });
    const updateData = JSON.parse(updateRes.content.toString().replace(/```json|```/g, '').trim());

    await (supabaseAdmin
      .from('cognitive_profiles') as any)
      .update({
        dominant_patterns: updatedPatterns,
        belief_update_rate: profile.belief_update_rate + (updateData.beliefUpdate ? 1 : 0),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

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

export async function analyzeLongitudinal(userId: string, executionModel: ChatGoogleGenerativeAI) {
  if (!supabaseAdmin) return;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  try {
      const [sessions, decisions] = await Promise.all([
          (supabaseAdmin.from('session_chunks') as any).select('*').eq('user_id', userId).gte('created_at', sevenDaysAgo),
          (supabaseAdmin.from('decisions') as any).select('*').eq('user_id', userId).gte('created_at', sevenDaysAgo)
      ]);

      const context = `
      Sessions: ${sessions.data?.map((s: any) => s.content).join('\n')}
      Decisions: ${decisions.data?.map((d: any) => `${d.description} (${d.predicted_confidence}%)`).join('\n')}
      `;

      const analyzePrompt = `
      Analyze 7 days of thinking for ${userId}. Identify Dominant Bias, Assumption Load, Calibration Score.
      Context: ${context}
      Return JSON: { "dominantBias": "...", "assumptionLoad": number, "calibrationScore": number, "updateRate": number }
      `;

      const res = await executionModel.invoke(analyzePrompt);
      const data = JSON.parse(res.content.toString().replace(/```json|```/g, '').trim());

      const today = new Date().toISOString().split('T')[0];
      await (supabaseAdmin.from('daily_cognitive_snapshots') as any).upsert({
          user_id: userId,
          snapshot_date: today,
          calibration_score: data.calibrationScore,
          assumption_load: data.assumptionLoad,
          belief_update_count: data.updateRate || 0,
          dominant_bias: data.dominantBias,
          radar_data: { skepticism: 50, curiosity: 50 }
      }, { onConflict: 'user_id,snapshot_date' });

      await (supabaseAdmin.from('cognitive_profiles') as any).update({
          dominant_patterns: [data.dominantBias],
          updated_at: new Date().toISOString()
      }).eq('user_id', userId);

  } catch (e) {
      console.error('[MirrorAI] Longitudinal Analysis failed:', e);
  }
}
