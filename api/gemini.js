const { GoogleGenerativeAI } = require('@google/generative-ai');

// Vercel Serverless Function handler nativo
module.exports = async (req, res) => {
  // Garante que a rota só aceita requisições do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key não configurada no painel da Vercel.' });
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

  // Testa os modelos um por um até obter sucesso
  for (const nomeModelo of modelosParaTestar) {
    try {
      const model = genAI.getGenerativeModel({ model: nomeModelo });
      const result = await model.generateContent(prompt);
      
      // Retorna o texto diretamente em formato JSON
      return res.json({ text: result.response.text() });
    } catch (error) {
      console.warn(`⚠️ Modelo ${nomeModelo} falhou no ambiente serverless.`);
    }
  }

  return res.status(503).json({ error: 'Todos os modelos falharam ou estão congestionados.' });
};