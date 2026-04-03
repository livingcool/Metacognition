import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import type { MirrorResponse, ContextPackage } from '@mirror/types';
import { RealityLayer } from './rag/reality.js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Modularized logic
import { reflect as reflectModule } from './modules/reflection.js';
import { closeSession as closeSessionModule, analyzeLongitudinal as analyzeLongitudinalModule } from './modules/memory.js';
import { searchResearch as searchResearchModule, searchUserHistory as searchUserHistoryModule } from './modules/retrieval.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MirrorAI — Core Orchestration Engine (Refactored)
 */
export class MirrorAI {
  private executionModel!: ChatGoogleGenerativeAI;
  private embeddings!: GoogleGenerativeAIEmbeddings;
  private reality!: RealityLayer;

  constructor() {
    // Load .env from workspace root
    const envPath = path.resolve(__dirname, '../../../.env');
    dotenv.config({ path: envPath });

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ AI: API key missing. AI features will fail.');
    } else {
      console.log(`[MirrorAI] Initializing...`);
    }

    try {
      this.executionModel = new ChatGoogleGenerativeAI({
        apiKey: apiKey || 'dummy-key',
        model: 'gemini-2.5-flash',
        temperature: 0.1,
      });

      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey || 'dummy-key',
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
   * SSE Stream Reflection
   */
  async *reflect(context: ContextPackage): AsyncGenerator<Partial<MirrorResponse>> {
    const stream = reflectModule(context, this.embeddings, this.reality);
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * Session Closure & Memory Write-back
   */
  async closeSession(userId: string, sessionId: string) {
    return closeSessionModule(userId, sessionId, this.embeddings, this.executionModel);
  }

  /**
   * Macro-Analysis Engine
   */
  async analyzeLongitudinal(userId: string) {
    return analyzeLongitudinalModule(userId, this.executionModel);
  }

  /**
   * RAG Helpers
   */
  async searchResearch(query: string, limit: number = 3) {
    return searchResearchModule(this.embeddings, query, limit);
  }

  async searchUserHistory(userId: string, query: string, limit: number = 3) {
    return searchUserHistoryModule(this.embeddings, userId, query, limit);
  }
}

export const mirrorAI = new MirrorAI();
