import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listAllModels() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // just to check connection
    // There is no listModels in the high level client directly, but we can try to find valid strings
    console.log("Checking common model names...");
    const testModels = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-1.0-pro"];
    for (const m of testModels) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("test");
            console.log(`✅ ${m} is working`);
        } catch (e) {
            console.log(`❌ ${m} failed: ${e.message}`);
        }
    }
  } catch (e) {
    console.error("❌ Google AI Error:", e.message);
  }
}

listAllModels();
