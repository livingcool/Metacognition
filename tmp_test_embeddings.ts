import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function test() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: 'gemini-embedding-2-flash',
    // @ts-ignore
    outputDimensionality: 1536,
  });

  const res = await embeddings.embedQuery("Hello world");
  console.log("Vector length:", res.length);
}

test().catch(console.error);
