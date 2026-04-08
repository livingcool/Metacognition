import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✅ gemini-1.5-flash is accessible");
    
    // Check if 2.0 or 2.5 exists (unlikely 2.5)
    try {
        await genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        console.log("✅ gemini-2.0-flash is accessible");
    } catch (e) {}

  } catch (e) {
    console.error("❌ Google AI Error:", e.message);
  }
}

listModels();
