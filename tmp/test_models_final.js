import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listPossibleModels() {
  try {
    // We can't use listModels easily in the simple SDK without a lot of setup,
    // so let's just test the most likely candidates for 2026.
    const candidates = [
        "gemini-1.5-flash", 
        "gemini-1.5-pro", 
        "gemini-2.0-flash", 
        "gemini-1.0-pro"
    ];
    
    for (const m of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hi");
            console.log(`✅ ${m} works`);
        } catch (e) {
            console.log(`❌ ${m} fails: ${e.message}`);
        }
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

listPossibleModels();
