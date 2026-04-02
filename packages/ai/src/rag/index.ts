import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { supabase } from '@mirror/db';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * MirrorRAG — The Core Retrieval Search logic (Gemini Pivot)
 * Uses Google Generative AI embeddings truncated to 1536 dimensions.
 */
export class MirrorRAG {
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: 'gemini-embedding-2-preview',
      // @ts-ignore
      outputDimensionality: 1536,
    });
  }

  /**
   * Search Store A (Research Corpus)
   */
  async searchResearch(query: string, limit: number = 3) {
    const rawVector = await this.embeddings.embedQuery(query);
    const vector = rawVector.slice(0, 1536);
    
    console.log(`[MirrorRAG] Querying research with dimensions: ${vector.length}`);

    // Similarity search in Supabase using the match_research_chunks RPC
    const { data: chunks, error } = await supabase.rpc('match_research_chunks', {
      query_embedding: vector,
      match_threshold: 0.5, // Lowered significantly for better alpha retrieval
      match_count: limit,
    });

    if (error) {
      console.error('[MirrorRAG] Error searching research:', error);
      return [];
    }

    console.log(`[MirrorRAG] Research hits: ${chunks?.length || 0}`);

    return chunks || [];
  }

  /**
   * Search Store B (User History)
   */
  async searchUserHistory(userId: string, query: string, limit: number = 3) {
    const vector = await this.embeddings.embedQuery(query);

    const { data: chunks, error } = await supabase.rpc('match_session_chunks', {
      query_embedding: vector.slice(0, 1536),
      match_threshold: 0.6, // Historical logic can be loser
      match_count: limit,
      p_user_id: userId
    });

    if (error) {
      console.error('[MirrorRAG] Error searching user history:', error);
      return [];
    }

    return chunks || [];
  }

  /**
   * Parallel Search — Returns both as XML-formatted strings for LLM injection
   */
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

export const mirrorRAG = new MirrorRAG();
