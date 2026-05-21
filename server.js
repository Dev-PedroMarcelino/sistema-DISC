const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai'); 

dotenv.config();

//testar se a chave foi lida com sucesso:
console.log("🔥 TESTE DA CHAVE:", process.env.GEMINI_API_KEY ? "Carregou! Começa com " + process.env.GEMINI_API_KEY.substring(0, 10) : "Vazio / Undefined");

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/gemini', async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key não configurada no servidor (.env).' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório.' });
  }

  // 1. modelos do mais avançado para o mais estável
  const modelosParaTestar = [
    "gemini-3.5-flash", // Tentativa 1: O mais ponta de linha (alto risco de 503)
    "gemini-2.5-flash", // Tentativa 2: O meio-termo rápido
    "gemini-2.0-flash"  // Tentativa 3: O tanque de guerra (super estável)
  ];

  // CORREÇÃO DE SEGURANÇA: Usando a variável apiKey segura em vez da chave chumbada
  const genAI = new GoogleGenerativeAI(apiKey);

  // 2. O laço 'for' vai testar um por um
  for (const nomeModelo of modelosParaTestar) {
    try {
      console.log(`Tentando gerar relatório com o modelo: ${nomeModelo}...`);
      
      const model = genAI.getGenerativeModel({ model: nomeModelo });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      console.log(`✅ Sucesso! Relatório gerado usando o ${nomeModelo}.`);
      
      // Se deu certo, envia a resposta para o frontend e PARA o laço (return)
      return res.json({ text: text });
      
    } catch (error) {
      // Captura o erro (ex: 503 ou 429), avisa no console, e o 'for' continua para o próximo modelo
      console.warn(`⚠️ Modelo ${nomeModelo} falhou ou está ocupado. Motivo: ${error.message || 'Desconhecido'}`);
    }
  }

  // 3. Se o código chegou até aqui, TODOS os modelos falharam
  console.error('❌ Todos os modelos falharam. Servidores do Google congestionados.');
  res.status(503).json({ 
    error: 'Os servidores de Inteligência Artificial estão com alta demanda no momento. Por favor, aguarde alguns segundos e tente novamente.' 
  });
});

// Quando alguém acessar a raiz do site, entregue o HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 DISC app backend rodando em http://localhost:${port}`);
});

module.exports = app;