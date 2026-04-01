import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

/**
 * Mirror Ingestion Pipeline (Directory-Driven ESM Gemini Pivot)
 * Scans corpus/papers/ and ingests all PDFs directly using gemini-embedding-001.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const CORPUS_DIR = path.resolve(__dirname, '../corpus/papers');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !googleApiKey) {
  console.error('❌ Missing credentials in .env. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Using the stable gemini-embedding-001 model
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: googleApiKey,
  modelName: 'gemini-embedding-001',
});

async function ingest() {
  console.log('🚀 Mirror Ingestion Pipeline (Directory-Driven) Started...');
  console.log('--- Diagnostics ---');
  console.log('Model:', 'gemini-embedding-001');
  console.log('Target Dimensions:', 1536);
  console.log('-------------------');

  if (!fs.existsSync(CORPUS_DIR)) {
    console.error('❌ papers/ directory not found');
    return;
  }

  const files = fs.readdirSync(CORPUS_DIR).filter(f => f.endsWith('.pdf'));

  if (files.length === 0) {
    console.warn('⚠️ No PDFs found in papers/ directory.');
    return;
  }

  for (const filename of files) {
    const pdfPath = path.join(CORPUS_DIR, filename);

    // Metadata extraction from filename: {author}_{year}_{keyword}.pdf
    const match = filename.match(/^([^_]+)_(\d{4})_/);
    const author = match ? match[1] : 'Unknown';
    const year = match ? parseInt(match[2]) : 0;

    console.log(`[Ingest] Processing: ${filename} (Author: ${author}, Year: ${year})...`);
    
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdf(dataBuffer);
      const text = pdfData.text;

      const chunkSize = 2000;
      const overlap = 200;
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.slice(i, i + chunkSize));
      }

      console.log(`[Ingest] Chunks generated: ${chunks.length}`);

      for (const chunk of chunks) {
        if (chunk.trim().length < 100) continue;

        // Gemini embeddings are 3072. Schema is 1536. Truncate.
        const fullEmbedding = await embeddings.embedQuery(chunk);
        const embedding = fullEmbedding.slice(0, 1536);
        
        const { error } = await supabaseAdmin.from('research_chunks').insert({
          filename,
          content: chunk,
          embedding,
          author,
          year,
          bias_categories: []
        });

        if (error) console.error(`[Ingest] DB Error:`, error.message);
      }
      
      console.log(`[Ingest] Finished: ${filename}`);
    } catch (err) {
      console.error(`[Ingest] Failed ${filename}:`, err.message);
    }
  }

  console.log('✅ Gemini Ingestion Pipeline Complete.');
}

ingest().catch(console.error);
