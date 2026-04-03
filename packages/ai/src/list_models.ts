import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Some versions of the SDK might not have listModels easily accessible this way
    console.log("Listing models is not supported in this script version. Please use Google AI Studio.");
  } catch (err: any) {
    console.error("Error listing models:", err?.message || err);
  }
}

listModels();
