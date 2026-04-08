const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../../.env' });

async function testEmbedding() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
  
  try {
    const result = await model.embedContent({
      content: { role: "user", parts: [{ text: "Hello world" }] },
      outputDimensionality: 1536
    });
    console.log("Dimension:", result.embedding.values.length);
  } catch (e) {
    console.error("Error:", e);
  }
}

testEmbedding();
