require('dotenv').config();
const { optimizeCodeWithAI } = require('../backend/services/aiService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'Code is required.' });
    }
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'Language is required.' });
    }

    const result = await optimizeCodeWithAI(code.trim(), language);
    return res.json(result);
  } catch (err) {
    console.error('[optimize-code]', err.message);
    return res.status(500).json({ error: err.message || 'Optimization failed.' });
  }
};
