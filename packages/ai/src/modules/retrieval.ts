import { supabase } from "@mirror/db";
import type { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export interface ResearchChunkResult {
  id: string;
  filename: string;
  content: string;
  author: string;
  year: number;
  bias_categories: string[];
  similarity: number;
}

export interface SessionChunkResult {
  id: string;
  session_id: string;
  content: string;
  pattern_surfaced: string | null;
  dna_scores: unknown;
  similarity: number;
}

export async function searchResearch(
  embeddings: GoogleGenerativeAIEmbeddings,
  query: string,
  limit: number = 3,
) {
  const rawVector = await embeddings.embedQuery(query);
  const vector = rawVector.slice(0, 1536);
  console.log(`[MirrorAI] Querying research with dimensions: ${vector.length}`);

  const { data: chunks, error } = await (supabase as any).rpc(
    "match_research_chunks",
    {
      query_embedding: vector,
      match_threshold: 0.5,
      match_count: limit,
    },
  );

  if (error) {
    console.error("[MirrorAI] Error searching research:", error);
    return [];
  }

  return (chunks || []) as ResearchChunkResult[];
}

export async function searchUserHistory(
  embeddings: GoogleGenerativeAIEmbeddings,
  userId: string,
  query: string,
  limit: number = 3,
) {
  const rawVector = await embeddings.embedQuery(query);
  const vector = rawVector.slice(0, 1536);
  console.log(
    `[MirrorAI] Querying user history with dimensions: ${vector.length}`,
  );

  const { data: chunks, error } = await (supabase as any).rpc(
    "match_session_chunks",
    {
      query_embedding: vector,
      match_threshold: 0.6,
      match_count: limit,
      p_user_id: userId,
    },
  );

  if (error) {
    console.error("[MirrorAI] Error searching user history:", error);
    return [];
  }

  return (chunks || []) as SessionChunkResult[];
}
