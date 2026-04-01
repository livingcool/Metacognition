import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

/**
 * Mirror Ingestion Pipeline (ESM Compatible Root Version)
 * PDF -> Text -> Chunk -> Embed -> Supabase
 */

// 1. Setup ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load .env from root

const CORPUS_DIR = path.resolve(__dirname, '../corpus/papers');
const MANIFEST_PATH = path.resolve(__dirname, '../corpus/manifest.csv');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing credentials in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: 'text-embedding-004',
});

async function ingest() {
  console.log('🚀 Mirror Ingestion Pipeline (Root Mode) Started...');
  
  // 1. Load Manifest
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ manifest.csv not found at:', MANIFEST_PATH);
    return;
  }

  const manifest = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const lines = manifest.split('\n').slice(1).filter(l => l.trim() !== '');

  for (const line of lines) {
    const parts = line.split(',');
    
    // Robust parsing for quoted titles/finding that contain commas
    let row = [];
    let currentPart = '';
    let insideQuote = false;
    for (let char of line) {
        if (char === '"') insideQuote = !insideQuote;
        else if (char === ',' && !insideQuote) {
            row.push(currentPart.trim());
            currentPart = '';
        } else {
            currentPart += char;
        }
    }
    row.push(currentPart.trim());

    const filename = row[0];
    const author = row[2];
    const year = row[3];
    const bias = row[6];

    const pdfPath = path.join(CORPUS_DIR, filename);

    if (!fs.existsSync(pdfPath)) {
      console.warn(`[Ingest] Skipping missing file: ${filename}`);
      continue;
    }

    console.log(`[Ingest] Processing: ${filename}...`);
    
    // 2. Extract Text
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // 3. Chunking (Simple overlap chunking)
    const chunkSize = 2000;
    const overlap = 200;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    console.log(`[Ingest] Chunks generated: ${chunks.length}`);

    // 4. Batch Embed & Store
    for (const chunk of chunks) {
      if (chunk.trim().length < 50) continue; // Skip tiny chunks

      const rawEmbedding = await embeddings.embedQuery(chunk);
      const embedding = rawEmbedding.slice(0, 1536);
      
      const { error } = await supabaseAdmin.from('research_chunks').insert({
        filename,
        content: chunk,
        embedding,
        author,
        year: parseInt(year) || 0,
        bias_categories: bias ? bias.split('|') : []
      });

      if (error) {
        console.error(`[Ingest] DB Error for ${filename}:`, error.message);
      }
    }
    
    console.log(`[Ingest] Finished: ${filename}`);
  }

  console.log('✅ Ingestion Pipeline Complete.');
}

ingest().catch(err => {
  console.error('❌ Ingestion Failed:', err);
  process.exit(1);
});
