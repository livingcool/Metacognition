require('dotenv').config({ path: '../../.env' });
const { mirrorAI } = require('@mirror/ai');

async function testRetrieval() {
  console.log("Testing RAG retrieval from Supabase...");
  
  const query = "What is the user's main cognitive pattern or any thought experiments?";
  console.log(`Query: "${query}"\n`);
  
  try {
    console.log("--- Testing Research Chunks ---");
    const research = await mirrorAI.searchResearch(query, 3);
    if (research && research.length > 0) {
      console.log(`Found ${research.length} research chunks:`);
      research.forEach((c, i) => console.log(`[${i+1}] Author: ${c.author} | Content: ${c.content.substring(0, 100)}...`));
    } else {
      console.log("No research chunks found matching the threshold.");
    }
  } catch (error) {
    console.error("Error retrieving research:", error);
  }

  console.log("\n--- Testing Session History ---");
  try {
    // using a dummy user ID for testing, or if there's a specific one from logs: 'user_3Bi1H56nxpwCzJJtx5FdZWp9IQR'
    const userId = "verification_user_node";
    const history = await mirrorAI.searchUserHistory(userId, query, 3);
    if (history && history.length > 0) {
      console.log(`Found ${history.length} session chunks for user ${userId}:`);
      history.forEach((c, i) => console.log(`[${i+1}] Session: ${c.session_id} | Content: ${c.content.substring(0, 100)}...`));
    } else {
      console.log("No session history found for this user.");
    }
  } catch (error) {
    console.error("Error retrieving session history:", error);
  }
}

testRetrieval();
