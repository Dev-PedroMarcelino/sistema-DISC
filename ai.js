function tidyReportText(text) {
  let cleaned = String(text || '');
  cleaned = cleaned.replace(/\*\(Nota de RH:[\s\S]*?\)\*/gi, '');
  cleaned = cleaned.replace(/Nota de RH:[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/^\*\s+/gm, '');
  cleaned = cleaned.replace(/^#+\s+/gm, function(header) {
    return header.replace(/#/g, '').trim() + '\n';
  });
  cleaned = cleaned.replace(/\r\n?/g, '\n');
  cleaned = cleaned.replace(/não pôde ser categorizado de forma estrita em um único vetor DISC\.?/gi, '');
  cleaned = cleaned.replace(/não há valores percentuais confiáveis disponíveis[\s\S]*$/gi, '');
  return cleaned.trim();
}

window.onAiAnalysisRequested = async function(payload) {
  const analysisStatus = document.getElementById('analysisStatus');
  if (analysisStatus) analysisStatus.textContent = 'Preparando prompt para o modelo generativo...';

  // 1. SOLUÇÃO DEFINITIVA: A IA "lê" os resultados direto da tela HTML!
  // Isso ignora falhas de comunicação entre os arquivos JS.
  const valD = parseFloat(document.getElementById('percentD')?.innerText || '0');
  const valI = parseFloat(document.getElementById('percentI')?.innerText || '0');
  const valS = parseFloat(document.getElementById('percentS')?.innerText || '0');
  const valC = parseFloat(document.getElementById('percentC')?.innerText || '0');

  const normalized = { D: valD, I: valI, S: valS, C: valC };

  // 2. CÁLCULO DE POSIÇÕES: Identifica o Top 1 e Top 2
  const arrayPercentuais = Object.entries(normalized); // Vira [['D', 34.1], ['I', 25.3], ...]
  arrayPercentuais.sort((a, b) => b[1] - a[1]); // Ordena do maior para o menor
  
  const letra1 = arrayPercentuais[0][0]; // 1º lugar
  const nota1 = arrayPercentuais[0][1];
  const letra2 = arrayPercentuais[1][0]; // 2º lugar
  const nota2 = arrayPercentuais[1][1];

  // Verifica se a diferença entre o 1º e o 2º lugar é de até 5%
  const diferenca = nota1 - nota2;
  const temPerfilEquilibrado = diferenca <= 5.0 && nota2 > 0;
  const hasPercentages = nota1 > 0;

  // Dicionário para traduzir a letra para a IA
  const nomesDisc = {
    'D': 'Dominância',
    'I': 'Influência',
    'S': 'Estabilidade',
    'C': 'Conformidade'
  };
  
  const nome1 = nomesDisc[letra1];
  const nome2 = nomesDisc[letra2];

  const percentageDetails = hasPercentages
    ? `Resultados exatos obtidos no teste: D: ${valD}%, I: ${valI}%, S: ${valS}%, C: ${valC}%.`
    : 'Não há valores percentuais confiáveis disponíveis.';

  // 3. LÓGICA DINÂMICA DO PROMPT
  let instrucoesDaIA = "";

  if (temPerfilEquilibrado) {
    instrucoesDaIA = `REGRA ABSOLUTA DE DIAGNÓSTICO:\n` +
    `De acordo com os cálculos, esta pessoa possui um PERFIL COMBINADO (Equilíbrio).\n` +
    `O perfil primário é **${nome1} (Letra ${letra1})** com ${nota1}%, mas o perfil secundário **${nome2} (Letra ${letra2})** com ${nota2}% está a uma diferença mínima (menos de 5%).\n` +
    `Baseie o resumo, os pontos fortes e as limitações NESSA MISTURA exata de ${nome1} e ${nome2}. Explique de forma aprofundada como essas duas características interagem e se equilibram na personalidade dela.\n\n` +
    `Estrutura obrigatória:\n` +
    `1) Resumo do perfil combinado (Explique como ${nome1} e ${nome2} se complementam nesta pessoa).\n` +
    `2) Pontos fortes (3 itens misturando os benefícios dos dois perfis).\n` +
    `3) Riscos / limitações a observar (3 itens considerando o choque ou os excessos desses dois perfis juntos).\n` +
    `4) Plano de Ação (3 passos práticos focados nesse perfil duplo).`;
  } else {
    instrucoesDaIA = `REGRA ABSOLUTA DE DIAGNÓSTICO:\n` +
    `De acordo com os cálculos matemáticos do sistema, o PERFIL PREDOMINANTE (PRINCIPAL) DESTA PESSOA É: **${nome1} (Letra ${letra1})** com ${nota1}%.\n` +
    `Baseie todo o resumo, os pontos fortes e as limitações ESTRITAMENTE no perfil ${nome1}. Jamais diga que outro perfil é o principal.\n\n` +
    `Estrutura obrigatória:\n` +
    `1) Resumo do perfil principal (Explique as características focando em ${nome1}).\n` +
    `2) Pontos fortes (3 itens baseados no perfil ${nome1}).\n` +
    `3) Riscos / limitações a observar (3 itens baseados no perfil ${nome1}).\n` +
    `4) Plano de Ação (3 passos práticos).`;
  }

  // Nome e data de nascimento recuperados do localStorage (caso o payload venha vazio)
  const nomeParticipante = payload.participantName || localStorage.getItem('discParticipantName') || 'Candidato';
  const nascParticipante = payload.participantBirth || localStorage.getItem('discParticipantBirth') || 'Não informada';

  // O prompt final
  const prompt = `Atue como um analista de RH sênior. Gere um Relatório de Análise Comportamental DISC oficial e impessoal (terceira pessoa) para: ${nomeParticipante} (nascimento: ${nascParticipante}).\n\n` +
    `[DADOS RIGOROSOS DO TESTE]\n` +
    `${percentageDetails}\n\n` +
    `${instrucoesDaIA}`;

  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxOutputTokens: 800 })
    });

    if (res.ok) {
      const json = await res.json();
      const text = json.text || '';
      if (text) {
        window.deliverAiAnalysis(text);
        return;
      }
    }

    throw new Error('Resposta inválida do proxy AI');
  } catch (err) {
    console.error('AI request error:', err);
    if (analysisStatus) analysisStatus.textContent = 'Erro ao chamar o proxy de IA. Usando fallback local.';
  }

  const fallback = `Análise DISC para ${nomeParticipante}: perfil dominante calculado: ${letra1}.\n\n${percentageDetails}\n\nResumo: Este texto é uma análise local de exemplo. Para uma análise completa, configure a chave no servidor e reinicie o backend.`;
  window.deliverAiAnalysis(fallback);
};

window.deliverAiAnalysis = function(analysisText) {
  const analysisStatus = document.getElementById('analysisStatus');
  const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  const openReportBtn = document.getElementById('openReportBtn');

  if (!analysisText) {
    if (analysisStatus) {
      analysisStatus.textContent = 'Não foi possível receber o texto da IA. Tente novamente.';
    }
    if (aiAnalysisBtn) {
      aiAnalysisBtn.disabled = false;
    }
    return;
  }

  if (window.quizAppState) {
    window.quizAppState.aiAnalysisContent = analysisText;
  }

  // Salva o texto bruto do relatório no localStorage de forma limpa
  localStorage.setItem('discAiReport', analysisText);

  if (analysisStatus) {
    analysisStatus.textContent = 'Análise completa pronta! Clique abaixo para gerenciar seu relatório.';
  }
  
  if (aiAnalysisBtn) aiAnalysisBtn.classList.add('hidden');
  if (downloadReportBtn) downloadReportBtn.classList.remove('hidden');
  if (openReportBtn) openReportBtn.classList.remove('hidden');
};