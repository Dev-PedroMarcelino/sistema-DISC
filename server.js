const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai'); 

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

app.use(express.json());

// --- A CORREÇÃO (O PLANO B) ---
// 1. Libera o CSS, as imagens (pasta midia) e os scripts
app.use(express.static(__dirname));

// 2. Entrega o index.html quando a página inicial é acessada
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// ------------------------------

// ROTA EXCLUSIVA PARA A IA
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

module.exports = app;