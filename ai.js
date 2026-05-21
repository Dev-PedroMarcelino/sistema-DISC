function normalizePercentageValues(percentages) {
  const safe = percentages || {};
  return {
    D: Number.isFinite(parseFloat(safe.D)) ? parseFloat(safe.D) : 0,
    I: Number.isFinite(parseFloat(safe.I)) ? parseFloat(safe.I) : 0,
    S: Number.isFinite(parseFloat(safe.S)) ? parseFloat(safe.S) : 0,
    C: Number.isFinite(parseFloat(safe.C)) ? parseFloat(safe.C) : 0
  };
}

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

  const normalized = normalizePercentageValues(payload.percentages || {});
  const totals = payload.totals || { D: 0, I: 0, S: 0, C: 0 };
  const hasPercentages = Object.values(normalized).some(value => value > 0);

  // 1. CÁLCULO À PROVA DE BALAS: Identifica o Top 1 e Top 2 para checar equilíbrio
  const arrayPercentuais = Object.entries(normalized); // Vira [['D', 34.1], ['I', 25.3], ...]
  arrayPercentuais.sort((a, b) => b[1] - a[1]); // Ordena do maior para o menor
  
  const letra1 = arrayPercentuais[0][0]; // 1º lugar
  const nota1 = arrayPercentuais[0][1];
  const letra2 = arrayPercentuais[1][0]; // 2º lugar
  const nota2 = arrayPercentuais[1][1];

  // Verifica se a diferença entre o 1º e o 2º lugar é de até 5%
  const diferenca = nota1 - nota2;
  const temPerfilEquilibrado = diferenca <= 5.0 && nota2 > 0;

  // Dicionário para traduzir a letra para a IA não se confundir
  const nomesDisc = {
    'D': 'Dominância',
    'I': 'Influência',
    'S': 'Estabilidade',
    'C': 'Conformidade'
  };
  
  const nome1 = nomesDisc[letra1];
  const nome2 = nomesDisc[letra2];

  const percentageDetails = hasPercentages
    ? `Dados exatos: Totais D ${totals.D.toFixed(1)}, I ${totals.I.toFixed(1)}, S ${totals.S.toFixed(1)}, C ${totals.C.toFixed(1)}; Percentuais D ${normalized.D.toFixed(1)}%, I ${normalized.I.toFixed(1)}%, S ${normalized.S.toFixed(1)}%, C ${normalized.C.toFixed(1)}%.`
    : 'Não há valores percentuais confiáveis disponíveis.';

  // 2. LÓGICA DINÂMICA DO PROMPT: O JS escolhe qual regra enviar para a IA
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

  // O prompt final junta os dados com as instruções que o JS escolheu acima
  const prompt = `Atue como um analista de RH sênior. Gere um Relatório de Análise Comportamental DISC oficial e impessoal (terceira pessoa) para: ${payload.participantName} (nascimento: ${payload.participantBirth}).\n\n` +
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

  const fallbackPercentages = normalizePercentageValues(payload.percentages || {});
  const fallbackPercentText = Object.values(fallbackPercentages).some(value => value > 0)
    ? `Resultados percentuais: D ${fallbackPercentages.D}%, I ${fallbackPercentages.I}%, S ${fallbackPercentages.S}%, C ${fallbackPercentages.C}%.`
    : 'Não há percentuais completos disponíveis.';

  const fallback = `Análise DISC para ${payload.participantName}: perfil dominante calculado: ${letra1}.\n\n${fallbackPercentText}\n\nResumo: Este texto é uma análise local de exemplo. Para uma análise completa, configure a chave no servidor e reinicie o backend.`;
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

  // CORREÇÃO ESTRUTURAL: Salva o texto bruto do relatório no localStorage de forma limpa
  localStorage.setItem('discAiReport', analysisText);

  if (analysisStatus) {
    analysisStatus.textContent = 'Análise completa pronta! Clique abaixo para gerenciar seu relatório.';
  }
  
  if (aiAnalysisBtn) aiAnalysisBtn.classList.add('hidden');
  if (downloadReportBtn) downloadReportBtn.classList.remove('hidden');
  if (openReportBtn) openReportBtn.classList.remove('hidden');
};