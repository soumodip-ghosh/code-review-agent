const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const models = await genAI.listModels();
  console.log('Available models:');
  models.forEach(model => {
    console.log(model.name);
  });
}

listModels().catch(console.error);