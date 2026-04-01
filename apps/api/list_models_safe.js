require('dotenv').config({ path: '../../.env' });
const apiKey = process.env.GOOGLE_API_KEY;

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    const embeddings = data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));
    console.log("Embeddings available:", embeddings.map(m => m.name));
    
    const reasoning = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
    console.log("Reasoning available:", reasoning.map(m => m.name));
  })
  .catch(console.error);
