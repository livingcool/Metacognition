import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy to get client
  // Using direct fetch for model list as the SDK varies
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await resp.json();
  console.log(JSON.stringify(data.models.map((m: any) => m.name), null, 2));
}

listModels();
