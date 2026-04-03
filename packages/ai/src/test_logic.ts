import { MirrorAI } from './index.js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function testLogic() {
  const ai = new MirrorAI();
  const context = {
    userId: 'test-user',
    sessionId: 'test-session',
    input: "I need to work more because I'm not successful, and I'm not successful because I don't work enough.",
    profile: { dominant_patterns: [] },
    lastThreeTurns: []
  };

  console.log("--- Testing Circular Reasoning ---");
  console.log("Input:", context.input);
  
  const decision = await (ai as any).orchestrate(context);
  console.log("\nOrchestration Decision:");
  console.log(JSON.stringify(decision, null, 2));

  console.log("\n--- Testing Reflection Stream ---");
  const generator = ai.reflect(context as any);
  for await (const chunk of generator) {
    console.log("Chunk:", JSON.stringify(chunk, null, 2));
  }
}

testLogic().catch(console.error);
