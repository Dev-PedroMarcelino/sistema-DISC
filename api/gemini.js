const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  // Trava de segurança para aceitar apenas requisições corretas
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
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

  // Nossa cascata de modelos que funcionou perfeitamente
  for (const nomeModelo of modelosParaTestar) {
    try {
      const model = genAI.getGenerativeModel({ model: nomeModelo });
      const result = await model.generateContent(prompt);
      return res.status(200).json({ text: result.response.text() });
    } catch (error) {
      console.warn(`Modelo ${nomeModelo} falhou, testando o próximo...`);
    }
  }

  return res.status(503).json({ error: 'Servidores congestionados no momento.' });
};