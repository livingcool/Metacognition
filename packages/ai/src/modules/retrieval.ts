import { supabase } from '@mirror/db';
import type { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export async function searchResearch(embeddings: GoogleGenerativeAIEmbeddings, query: string, limit: number = 3) {
  const rawVector = await embeddings.embedQuery(query);
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

export async function searchUserHistory(embeddings: GoogleGenerativeAIEmbeddings, userId: string, query: string, limit: number = 3) {
  const rawVector = await embeddings.embedQuery(query);
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
