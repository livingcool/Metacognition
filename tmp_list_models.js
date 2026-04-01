const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const models = await genAI.getGenerativeModel({ model: "gemini-pro" }); // placeholder
  // The actual way to list is via the client
  try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
      const data = await response.json();
      console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch (e) {
      console.error(e);
  }
}

listModels();
