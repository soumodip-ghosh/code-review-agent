const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

listModels();