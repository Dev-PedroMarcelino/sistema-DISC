const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai'); 

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

app.use(express.json());

// ROTA EXCLUSIVA PARA A INTELIGÊNCIA ARTIFICIAL
app.post('/api/gemini', async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key não configurada.' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório.' });
  }

  const modelosParaTestar = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash" 
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const nomeModelo of modelosParaTestar) {
    try {
      console.log(`Tentando modelo: ${nomeModelo}...`);
      const model = genAI.getGenerativeModel({ model: nomeModelo });
      const result = await model.generateContent(prompt);
      return res.json({ text: result.response.text() });
    } catch (error) {
      console.warn(`⚠️ Modelo ${nomeModelo} falhou. Tentando próximo...`);
    }
  }

  res.status(503).json({ error: 'Servidores congestionados. Aguarde e tente novamente.' });
});

app.listen(port, () => {
  console.log(`🚀 API rodando na porta ${port}`);
});

// Essencial para a Vercel
module.exports = app;