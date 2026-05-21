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

  // 1. CÁLCULO À PROVA DE BALAS: O JS descobre quem é o verdadeiro dominante
  const arrayPercentuais = Object.entries(normalized); // Vira [['D', 34.1], ['I', 25.3], ...]
  arrayPercentuais.sort((a, b) => b[1] - a[1]); // Ordena do maior para o menor
  const letraVencedora = arrayPercentuais[0][0]; // Pega a letra em 1º lugar (ex: 'D')
  const notaVencedora = arrayPercentuais[0][1]; // Pega a nota em 1º lugar (ex: 34.1)

  const percentageDetails = hasPercentages
    ? `Dados exatos: Totais D ${totals.D.toFixed(1)}, I ${totals.I.toFixed(1)}, S ${totals.S.toFixed(1)}, C ${totals.C.toFixed(1)}; Percentuais D ${normalized.D.toFixed(1)}%, I ${normalized.I.toFixed(1)}%, S ${normalized.S.toFixed(1)}%, C ${normalized.C.toFixed(1)}%.`
    : 'Não há valores percentuais confiáveis disponíveis.';

  // 2. ARQUITETURA DO PROMPT INVERTIDA: Dados e regras estritas no topo!
  const prompt = `Atue como um analista de RH sênior. Gere um Relatório de Análise Comportamental DISC oficial e impessoal (terceira pessoa) para: ${payload.participantName} (nascimento: ${payload.participantBirth}).\n\n` +
    `[DADOS RIGOROSOS DO TESTE]\n` +
    `${percentageDetails}\n\n` +
    `REGRA ABSOLUTA DE DIAGNÓSTICO:\n` +
    `De acordo com os cálculos matemáticos do sistema, o PERFIL DOMINANTE REAL DESTA PESSOA É O: **${letraVencedora}** (com ${notaVencedora}%).\n` +
    `Baseie todo o resumo, os pontos fortes e as limitações ESTRITAMENTE no perfil ${letraVencedora}. Jamais mencione outros perfis como dominantes.\n\n` +
    `Estrutura obrigatória:\n` +
    `1) Resumo do perfil dominante (Explique as características focando na letra ${letraVencedora}).\n` +
    `2) Pontos fortes (3 itens baseados no perfil ${letraVencedora}).\n` +
    `3) Riscos / limitações a observar (3 itens baseados no perfil ${letraVencedora}).\n` +
    `4) Plano de Ação (3 passos práticos).`;

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

  const fallback = `Análise DISC para ${payload.participantName}: perfil dominante calculado: ${letraVencedora}.\n\n${fallbackPercentText}\n\nResumo: Este texto é uma análise local de exemplo. Para uma análise completa, configure a chave no servidor e reinicie o backend.`;
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

  const containerRelatorio = document.getElementById('relatorioIA');
  if (containerRelatorio) {
    const cleaned = tidyReportText(analysisText);
    const rendered = window.marked ? marked.parse(cleaned) : cleaned.replace(/\n/g, '<br>');
    
    // Agora o texto vai puro, pois a div com o estilo já está lá no HTML
    containerRelatorio.innerHTML = rendered; 
  }

  if (analysisStatus) {
    analysisStatus.textContent = 'Análise completa pronta! Clique para ler ou baixar o PDF.';
  }
  
  if (aiAnalysisBtn) aiAnalysisBtn.classList.add('hidden');
  if (downloadReportBtn) downloadReportBtn.classList.remove('hidden');
  
  // Exibe o botão que abre a tela cheia
  if (openReportBtn) openReportBtn.classList.remove('hidden');
};