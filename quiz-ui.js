if (pageType === 'quiz') {
  pageTransition();

  const displayName = document.getElementById('displayName');
  const quizProgress = document.getElementById('quizProgress');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizHint = document.getElementById('quizHint');
  const modeButtons = Array.from(document.querySelectorAll('#modeButtons button'));
  const beginQuiz = document.getElementById('beginQuiz');
  const answerButtonsContainer = document.getElementById('answerButtons');
  const modePanel = document.querySelector('.mode-panel');

  function updateBeginButton() {
    beginQuiz.style.display = state.selectedMode ? 'inline-flex' : 'none';
    beginQuiz.disabled = !participant || !state.selectedMode;
  }
  const startNote = document.getElementById('startNote');
  const resetQuiz = document.getElementById('resetQuiz');
  const questionPanel = document.getElementById('questionPanel');
  const resultScreen = document.getElementById('resultScreen');
  const resultTitle = document.getElementById('resultTitle');
  const resultDescription = document.getElementById('resultDescription');
  const percentD = document.getElementById('percentD');
  const percentI = document.getElementById('percentI');
  const percentS = document.getElementById('percentS');
  const percentC = document.getElementById('percentC');
  const radarChart = document.getElementById('radarChart');
  const restartQuiz = document.getElementById('restartQuiz');
  const quizModeLabel = document.getElementById('quizModeLabel');
  const modeSummary = document.getElementById('modeSummary');
  const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  const analysisStatus = document.getElementById('analysisStatus');

  const participant = localStorage.getItem('discParticipantName');

  function playCelebrationSound() {
    const audioFile = 'midia/ff_vitoria.mp3';
    const audio = new Audio(audioFile);
    audio.volume = 0.85;
    audio.play().catch(() => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const now = audioCtx.currentTime;
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(560, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start(now);
      oscillator.stop(now + 1.2);
    });
  }

  function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    for (let i = 0; i < 80; i += 1) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const colors = ['#f43b71', '#5f7cf6', '#ffd166', '#4ecdc4', '#ff8c42'];
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.width = `${Math.random() * 10 + 6}px`;
      piece.style.height = `${Math.random() * 18 + 10}px`;
      piece.style.opacity = `${0.8 + Math.random() * 0.2}`;
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3600);
  }

  function animateAnswerSelection(button) {
    if (!button) return;
    button.classList.add('answer-selected');
    setTimeout(() => button.classList.remove('answer-selected'), 420);
    triggerQuestionCardPulse();
  }

  function triggerQuestionCardPulse() {
    const questionCard = document.querySelector('.question-card');
    if (!questionCard) return;
    questionCard.classList.add('pop');
    setTimeout(() => questionCard.classList.remove('pop'), 420);
  }

  const state = {
    selectedMode: localStorage.getItem('discQuizMode') || '',
    quizMode: localStorage.getItem('discQuizMode') || '',
    participantName: participant,
    participantBirth: localStorage.getItem('discParticipantBirth') || '',
    quizLength: 0,
    currentIndex: 0,
    quizStarted: false,
    answers: [],
    questionSet: [],
    lastResultData: null,
    aiAnalysisContent: ''
  };

  window.quizAppState = state;

  function setMode(mode) {
    state.selectedMode = mode;
    state.quizMode = mode;
    localStorage.setItem('discQuizMode', mode);
    state.quizLength = Math.min(quizModes[mode], questions.length);
    state.questionSet = shuffleArray([...questions]).slice(0, state.quizLength);
    modeButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
    beginQuiz.disabled = !participant || !state.selectedMode;
    quizModeLabel.textContent = `Modo ${modeLabel[mode]} selecionado`;
    modeSummary.textContent = `Você escolheu o modo ${modeLabel[mode]}. Serão ${state.quizLength} perguntas com respostas ordenadas aleatoriamente.`;
    updateHint();
    updateBeginButton();
  }

  function updateHint() {
    if (!participant) {
      quizHint.textContent = 'Faça login em index.html antes de iniciar o questionário.';
      return;
    }
    if (!state.selectedMode) {
      quizHint.textContent = 'Selecione simples, médio ou completo para começar.';
      return;
    }
    if (state.quizStarted) {
      quizHint.textContent = 'Escolha a alternativa que mais combina com sua maneira de agir.';
      return;
    }
    quizHint.textContent = `Modo ${modeLabel[state.selectedMode]} selecionado. Clique em Iniciar questionário para começar.`;
  }

  const discScoreProfile = {
    D: { D: 1.0, I: 0.20, S: 0.08, C: 0.14 },
    I: { D: 0.16, I: 1.0, S: 0.12, C: 0.06 },
    S: { D: 0.08, I: 0.12, S: 1.0, C: 0.08 },
    C: { D: 0.12, I: 0.08, S: 0.10, C: 1.0 }
  };

  function buildAnswerScores(option) {
    if (option.scores && typeof option.scores === 'object') {
      return {
        D: Number(option.scores.D) || 0,
        I: Number(option.scores.I) || 0,
        S: Number(option.scores.S) || 0,
        C: Number(option.scores.C) || 0
      };
    }

    const mainDisc = option.disc;
    const scale = Number(option.value) || 1;
    const baseProfile = discScoreProfile[mainDisc] || { D: 0, I: 0, S: 0, C: 0 };
    return {
      D: Number((baseProfile.D * scale).toFixed(2)),
      I: Number((baseProfile.I * scale).toFixed(2)),
      S: Number((baseProfile.S * scale).toFixed(2)),
      C: Number((baseProfile.C * scale).toFixed(2))
    };
  }

  function formatPercentage(value) {
    if (!Number.isFinite(value)) return '0%';
    const formatted = Number(value.toFixed(1));
    return `${formatted}${Number.isInteger(formatted) ? '' : ''}%`;
  }

  function renderAnswerOptions(question) {
    answerButtonsContainer.innerHTML = '';
    const shuffledOptions = shuffleArray([...question.options]);
    shuffledOptions.forEach(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `btn btn-answer btn-answer-${option.disc}`;
      button.dataset.disc = option.disc;
      button.dataset.value = option.value;
      button.textContent = option.label;
      button.disabled = !state.quizStarted;
      button.addEventListener('click', () => {
        if (!state.quizStarted) return;
        const scores = buildAnswerScores(option);
        state.answers.push({
          disc: option.disc,
          value: option.value,
          scores
        });
        animateAnswerSelection(button);
        state.currentIndex += 1;

        if (state.currentIndex >= state.quizLength) {
          createConfetti();
          playCelebrationSound();
          setTimeout(showResults, 760);
        } else {
          setTimeout(updateQuestion, 260);
        }
      });
      answerButtonsContainer.appendChild(button);
    });
  }

  function updateQuestion() {
    if (state.currentIndex < state.quizLength) {
      const currentQuestion = state.questionSet[state.currentIndex];
      quizQuestion.textContent = currentQuestion.question;
      quizProgress.textContent = `Pergunta ${state.currentIndex + 1} de ${state.quizLength}`;
      quizHint.textContent = 'Escolha a alternativa que mais combina com sua maneira de agir.';
      renderAnswerOptions(currentQuestion);
    } else {
      showResults();
    }
  }

  function resetToSelection() {
    state.quizStarted = false;
    state.currentIndex = 0;
    state.answers = [];
    state.lastResultData = null;
    state.aiAnalysisContent = '';
    resultScreen.classList.remove('visible');
    questionPanel.classList.remove('hidden');
    if (modePanel) {
      modePanel.classList.remove('hidden');
    }
    answerButtonsContainer.innerHTML = '<div class="answer-note">Escolha um modo acima e depois clique em Iniciar questionário para ver as respostas.</div>';
    updateHint();
    updateBeginButton();
    quizModeLabel.textContent = state.selectedMode ? `Modo ${modeLabel[state.selectedMode]} selecionado` : 'Escolha um modo para começar';
    modeSummary.textContent = state.selectedMode ? `Você escolheu o modo ${modeLabel[state.selectedMode]}. Serão ${state.quizLength} perguntas com respostas ordenadas aleatoriamente.` : 'Selecione um modo para ver mais detalhes.';
    quizProgress.textContent = state.selectedMode ? `Modo ${modeLabel[state.selectedMode]}` : 'Escolha um modo para começar';
    quizQuestion.textContent = state.selectedMode ? 'Clique para iniciar e responder à primeira pergunta.' : 'Selecione um modo para começar.';
    startNote.style.display = participant ? 'none' : 'block';
    beginQuiz.disabled = !participant || !state.selectedMode;
    aiAnalysisBtn.classList.remove('hidden');
    aiAnalysisBtn.disabled = false;
    downloadReportBtn.classList.add('hidden');
    analysisStatus.textContent = 'Ao terminar, você poderá solicitar uma análise completa por IA.';
  }

  function startQuizFlow() {
    if (!participant) {
      navigateTo('index.html');
      return;
    }
    if (!state.selectedMode) {
      alert('Por favor, selecione um modo antes de iniciar.');
      return;
    }
    state.quizStarted = true;
    state.currentIndex = 0;
    state.answers = [];
    resultScreen.classList.remove('visible');
    questionPanel.classList.remove('hidden');
    if (modePanel) {
      modePanel.classList.add('hidden');
    }
    beginQuiz.style.display = 'none';
    quizModeLabel.textContent = `Respondendo o modo ${modeLabel[state.selectedMode]}...`;
    modeSummary.textContent = 'Responda com sinceridade para um resultado mais fiel.';
    startNote.style.display = 'none';
    updateQuestion();
  }

  function showResults() {
    state.quizStarted = false;
    questionPanel.classList.add('hidden');
    quizModeLabel.textContent = 'Resultado final';
    modeSummary.textContent = 'Veja seus valores DISC e solicite a análise completa por IA se quiser um relatório mais profundo.';
    resultScreen.classList.add('visible');
    renderResults();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function renderResults() {
    const totals = { D: 0, I: 0, S: 0, C: 0 };
    state.answers.forEach(answer => {
      const scores = answer.scores || { D: 0, I: 0, S: 0, C: 0 };
      totals.D += Number(scores.D) || 0;
      totals.I += Number(scores.I) || 0;
      totals.S += Number(scores.S) || 0;
      totals.C += Number(scores.C) || 0;
    });

    const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;
    const percentages = {
      D: (totals.D / total) * 100,
      I: (totals.I / total) * 100,
      S: (totals.S / total) * 100,
      C: (totals.C / total) * 100
    };

    const maxScore = Math.max(...Object.values(totals));
    const dominantKeys = Object.keys(totals).filter(key => totals[key] === maxScore);
    const dominantLabel = dominantKeys.map(key => discTitle[key]).join(' / ');
    const dominantCode = dominantKeys.length === 1 ? dominantKeys[0] : dominantKeys.join('/');

    resultTitle.innerHTML = dominantKeys.length === 1
      ? `<span class="disc-letter disc-${dominantCode}">${dominantCode}</span> ${discTitle[dominantCode]} predominante`
      : `<span class="disc-letter disc-${dominantKeys[0]}">${dominantKeys.join('/')}</span> ${dominantLabel} equilibrados`;

    const resultDetails = getResultDetails(dominantKeys, percentages, totals);
    resultDescription.textContent = resultDetails.summary;

    percentD.textContent = formatPercentage(percentages.D);
    percentI.textContent = formatPercentage(percentages.I);
    percentS.textContent = formatPercentage(percentages.S);
    percentC.textContent = formatPercentage(percentages.C);

    radarChart.innerHTML = buildRadarSvg(percentages);
    document.getElementById('discCardsContainer').innerHTML = buildDiscCards(percentages, dominantKeys);
    renderResultSections(resultDetails);

    state.lastResultData = {
      totals,
      percentages,
      dominant: dominantCode,
      dominantKeys,
      quizLength: state.quizLength,
      selectedMode: state.selectedMode,
      resultDetails
    };
    state.aiAnalysisContent = '';
    aiAnalysisBtn.classList.remove('hidden');
    aiAnalysisBtn.disabled = false;
    downloadReportBtn.classList.remove('hidden');
    analysisStatus.textContent = 'Deseja gerar uma análise completa por IA para esse perfil? Você também pode baixar o resultado como PDF.';
  }

  function renderResultSections(details) {
    const strengthsList = document.querySelector('#resultStrengths ul');
    const challengesList = document.querySelector('#resultChallenges ul');
    const recommendationsList = document.querySelector('#resultRecommendations ul');

    if (strengthsList) strengthsList.innerHTML = details.strengths.map(item => `<li>${item}</li>`).join('');
    if (challengesList) challengesList.innerHTML = details.challenges.map(item => `<li>${item}</li>`).join('');
    if (recommendationsList) recommendationsList.innerHTML = details.recommendations.map(item => `<li>${item}</li>`).join('');
  }

  function getResultDetails(dominantKeys, percentages, totals) {
    if (dominantKeys.length === 1) {
      const code = dominantKeys[0];
      const base = discDescriptions[code];
      const strength = {
        D: 'Ambição, assertividade e foco em resultados. Você tende a assumir liderança natural mesmo em situações complexas.',
        I: 'Entusiasmo, empatia e habilidade de conectar pessoas. Você influencia com carisma e engaja o ambiente ao seu redor.',
        S: 'Equilíbrio, paciência e confiança. Você constrói relações sólidas e traz estabilidade em contextos de mudança.',
        C: 'Rigor, análise e foco em qualidade. Você fortalece processos com precisão e lidera pela excelência técnica.'
      };
      const challenge = {
        D: 'Pode ser percebido como impaciente ou direto demais; cultivar escuta ativa ajuda a equilibrar o impacto.',
        I: 'Pode dispersar energia ao priorizar relacionamento sobre resultado; manter foco e prazo é essencial.',
        S: 'Pode resistir a mudanças rápidas; ampliar a assertividade e definir limites evita sobrecarga.',
        C: 'Pode travar em excesso de detalhes; tomar decisões mais ágeis reduz atrasos sem perder qualidade.'
      };
      return `${base} ${strength[code]} ${challenge[code]}`;
    }

    const pair = dominantKeys.join(' / ');
    const primary = discTitle[dominantKeys[0]];
    const secondary = discTitle[dominantKeys[1]];
    const comboDescriptions = {
      'D/I': `A combinação ${pair} indica um perfil dinâmico e inspirador: você une ação e persuasão, conseguindo liderar com energia e gerar influência na equipe. Esse equilíbrio é potente para projetos que exigem ritmo rápido e envolvimento humano.`,
      'D/S': `A combinação ${pair} mostra alguém com determinação e estabilidade: você busca resultados com cuidado, sustentando decisões com suporte e confiança do time. Esse perfil é valioso em contextos que precisam de ação estruturada.`,
      'D/C': `A combinação ${pair} expressa vontade de fazer acontecer com controle técnico. Você busca metas claras e qualidade rigorosa, atuando como um gestor orientado ao resultado sem descuidar do padrão.`,
      'I/S': `A combinação ${pair} revela alguém voltado à conexão e ao apoio. Você inspira pessoas com simpatia enquanto promove segurança emocional, sendo essencial em equipes que precisam de engajamento e estabilidade.`,
      'I/C': `A combinação ${pair} une influência e precisão: você comunica bem e valoriza dados, conseguindo convencer com argumentos sólidos e visão colaborativa. É um perfil eficaz para projetos criativos que exigem respaldo técnico.`,
      'S/C': `A combinação ${pair} combina cuidado e rigor. Você mantém o grupo seguro enquanto garante que processos estejam corretos, sendo um ponto de equilíbrio em equipes que precisam de consistência e qualidade.`
    };

    const comboText = comboDescriptions[pair] || `Seu perfil combina ${dominantLabel}, equilibrando diferentes forças comportamentais para adaptar sua ação com flexibilidade.`;
    const advice = {
      'D/I': 'Foque em ouvir o time antes de direcionar a ação, e use seu carisma para envolver quem precisa de mais motivação.',
      'D/S': 'Cultive espaço para a equipe se sentir segura ao mesmo tempo em que mantém o ritmo nas entregas.',
      'D/C': 'Use sua precisão para reforçar decisões rápidas e evite paralisar-se em análises detalhadas.',
      'I/S': 'Trabalhe limites claros quando o ambiente exigir prioridade, sem perder o apoio e a empatia.',
      'I/C': 'Combine sua comunicação envolvente com dados objetivos para ganhar credibilidade e confiança.',
      'S/C': 'Abrace mudanças com pequenos passos planejados e mantenha a consistência sem permitir estagnação.'
    };
    const comboAdvice = advice[pair] || 'Use sua combinação de talentos para alternar entre ação, relacionamento e qualidade conforme o cenário exige.';

    return `${comboText} ${comboAdvice}`;
  }

  function buildDiscCards(percentages, activeKeys) {
    if (!Array.isArray(activeKeys)) {
      activeKeys = [activeKeys];
    }
    return ['D', 'I', 'S', 'C'].map(code => {
      return `
        <div class="disc-summary-card disc-${code}${activeKeys.includes(code) ? ' active' : ''}">
          ${discIconSvg(code)}
          <span>${discTitle[code]}</span>
          <h3 class="disc-label">${formatPercentage(percentages[code])}</h3>
          <div class="disc-progress">
            <div class="disc-progress-fill" style="width:${Math.min(100, percentages[code])}%;"></div>
          </div>
          <p>${discDescriptions[code]}</p>
        </div>
      `;
    }).join('');
  }

  function discIconSvg(code) {
    const icons = {
      D: '<svg class="disc-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 42L32 14l16 28H16z" fill="#e44b4b"/><path d="M21 45h22" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/></svg>',
      I: '<svg class="disc-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="28" r="12" fill="#f4b64c"/><path d="M32 42v14" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><path d="M20 24l-8-8" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><path d="M44 16l8 8" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/></svg>',
      S: '<svg class="disc-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 10c-9 0-18 7-18 18 0 18 18 26 18 26s18-8 18-26c0-11-9-18-18-18z" fill="#5cb27c"/><path d="M32 26v14" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><path d="M24 34l8 8 8-8" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none"/></svg>',
      C: '<svg class="disc-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="12" width="44" height="40" rx="8" fill="#4e8fe3"/><path d="M22 26h20" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><path d="M22 36h16" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><path d="M22 46h10" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/></svg>'
    };
    return icons[code] || '';
  }

  function buildRadarSvg(percentages) {
    const size = 380;
    const center = size / 2;
    const radius = 140;
    const axisPoints = ['D', 'I', 'S', 'C'].map((letter, index) => {
      const angle = (Math.PI / 2) + (index * (Math.PI / 2));
      const value = percentages[letter] / 100;
      const r = radius * (0.35 + value * 0.6);
      return {
        x: center + Math.cos(angle) * r,
        y: center - Math.sin(angle) * r,
        letter
      };
    });

    const polygonPoints = axisPoints.map(point => `${point.x},${point.y}`).join(' ');
    const grid = [0.25, 0.5, 0.75, 1].map(fraction => {
      const points = ['D', 'I', 'S', 'C'].map((_, index) => {
        const angle = (Math.PI / 2) + (index * (Math.PI / 2));
        return `${center + Math.cos(angle) * radius * fraction},${center - Math.sin(angle) * radius * fraction}`;
      }).join(' ');
      return `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />`;
    }).join('');

    const axes = ['D', 'I', 'S', 'C'].map((letter, index) => {
      const angle = (Math.PI / 2) + (index * (Math.PI / 2));
      const x = center + Math.cos(angle) * radius;
      const y = center - Math.sin(angle) * radius;
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.18)" stroke-width="1" />`;
    }).join('');

    const labels = axisPoints.map(point => {
      const offsetX = point.x > center ? 18 : point.x < center ? -18 : 0;
      const offsetY = point.y > center ? 20 : point.y < center ? -14 : 0;
      const anchor = point.x > center ? 'start' : point.x < center ? 'end' : 'middle';
      return `<text x="${point.x + offsetX}" y="${point.y + offsetY}" text-anchor="${anchor}" fill="#ffffff" font-size="14" font-weight="700">${point.letter}</text>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" class="radar-svg" aria-label="Gráfico radar DISC">
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.26)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.08)" />
          </linearGradient>
        </defs>
        <circle cx="${center}" cy="${center}" r="${radius + 8}" fill="rgba(255,255,255,0.05)" />
        ${grid}
        ${axes}
        <polygon points="${polygonPoints}" fill="url(#radarFill)" stroke="#ffffff" stroke-width="2" opacity="0.95" />
        ${labels}
      </svg>
    `;
  }

  function requestAiAnalysis() {
    if (!participant) {
      return;
    }

    aiAnalysisBtn.disabled = true;
    aiAnalysisBtn.classList.add('hidden');
    downloadReportBtn.classList.add('hidden');
    analysisStatus.textContent = 'Preparando dados para enviar à IA...';

    const safeResult = state.lastResultData || { totals: { D: 0, I: 0, S: 0, C: 0 }, percentages: { D: 0, I: 0, S: 0, C: 0 }, dominant: '' };
    const payload = {
      participantName: participant,
      participantBirth: localStorage.getItem('discParticipantBirth'),
      mode: state.selectedMode,
      quizLength: state.quizLength,
      answers: state.answers,
      totals: safeResult.totals,
      percentages: safeResult.percentages,
      dominant: safeResult.dominant,
      questions: state.questionSet.map((question, index) => ({
        prompt: question.question,
        answer: state.answers[index] ? state.answers[index].disc : null,
        value: state.answers[index] ? state.answers[index].value : null
      }))
    };

    if (typeof window.onAiAnalysisRequested === 'function') {
      window.onAiAnalysisRequested(payload);
      analysisStatus.textContent = 'Aguardando IA gerar análise completa...';
    } else {
      analysisStatus.textContent = 'Integre `window.onAiAnalysisRequested(payload)` para gerar o relatório por IA.';
      aiAnalysisBtn.disabled = false;
      aiAnalysisBtn.classList.remove('hidden');
    }
  }

  function buildResultSummaryForPdf(data) {
    const percentages = data.percentages || { D: 0, I: 0, S: 0, C: 0 };
    return `Relatório DISC automático:\n\nResultados percentuais estimados:\n- Dominância: ${formatPercentage(percentages.D)}\n- Influência: ${formatPercentage(percentages.I)}\n- Estabilidade: ${formatPercentage(percentages.S)}\n- Conformidade: ${formatPercentage(percentages.C)}\n\nUse estes valores como base para análise comportamental e consulte o relatório completo por IA se estiver disponível.`;
  }

  function createPdfAndSave(pdfData, analysisText) {
    const jsPDFConstructor = window.jspdf?.jsPDF;
    if (!jsPDFConstructor) {
      alert('Biblioteca jsPDF não encontrada. Não é possível gerar o PDF.');
      return false;
    }

    const birth = localStorage.getItem('discParticipantBirth') || 'Não informada';
    const doc = new jsPDFConstructor({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const maxWidth = 515;
    let y = 50;

    doc.setFillColor(67, 56, 202);
    doc.rect(0, 0, 595, 120, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise Comportamental DISC', margin, y);

    y += 37;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${participant}`, margin, y);
    y += 16;
    doc.text(`Nascimento: ${birth}`, margin, y);
    y += 16;
    doc.text(`Modo: ${modeLabel[state.selectedMode] || state.selectedMode || 'N/A'} (${state.quizLength} perguntas)`, margin, y);
    y += 26;

    const cleaned = String(analysisText || '')
      .replace(/\*?\(Nota de RH:[\s\S]*?\)\*?/gi, '')
      .replace(/Nota de RH:[\s\S]*$/gi, '')
      .replace(/[#*]/g, '')
      .replace(/\r\n?/g, '\n')
      .replace(/\n{2,}/g, '\n\n')
      .trim();

    doc.setTextColor(38, 50, 56);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise de perfil e recomendações', margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const analysisLines = doc.splitTextToSize(cleaned, maxWidth);
    doc.text(analysisLines, margin, y);
    y += analysisLines.length * 15 + 24;

    doc.setDrawColor(67, 56, 202);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + maxWidth, y);
    y += 18;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados técnicos DISC', margin, y);
    y += 20;

    const colors = {
      D: [228, 75, 75],
      I: [244, 182, 76],
      S: [92, 178, 124],
      C: [78, 143, 227]
    };

    Object.entries(pdfData.percentages || { D: 0, I: 0, S: 0, C: 0 }).forEach(([letter, value]) => {
      doc.setTextColor(colors[letter] || [55, 65, 81]);
      doc.setFont('helvetica', 'bold');
      doc.text(`${letter}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(33, 37, 41);
      doc.text(`${formatPercentage(value)}`, margin + 50, y);
      y += 18;
    });

    const fileName = `analise-comportamental-${participant.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    return true;
  }

  function downloadBehaviorReport() {
    if (!state.lastResultData && state.answers.length === 0) {
      alert('Não há dados suficientes para gerar o PDF. Responda ao questionário primeiro.');
      return;
    }

    const pdfData = state.lastResultData || {
      totals: { D: 0, I: 0, S: 0, C: 0 },
      percentages: { D: 0, I: 0, S: 0, C: 0 },
      dominant: 'não definido'
    };

    const analysisText = state.aiAnalysisContent || buildResultSummaryForPdf(pdfData);
    if (typeof window.generatePdfReport === 'function') {
      try {
        window.generatePdfReport({
          participant,
          birth: localStorage.getItem('discParticipantBirth'),
          mode: state.selectedMode,
          quizLength: state.quizLength,
          analysisText,
          lastResultData: pdfData,
          modeLabel
        });
        return;
      } catch (error) {
        console.error('Erro ao chamar generatePdfReport:', error);
      }
    }

    if (!createPdfAndSave(pdfData, analysisText)) {
      alert('Não foi possível gerar o PDF automaticamente. Verifique se a biblioteca jsPDF está carregada.');
    }
  }

  modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      setMode(button.dataset.mode);
      resetToSelection();
    });
  });

  beginQuiz.addEventListener('click', startQuizFlow);
  resetQuiz.addEventListener('click', clearSession);
  restartQuiz.addEventListener('click', resetToSelection);
  aiAnalysisBtn.addEventListener('click', requestAiAnalysis);
  downloadReportBtn.addEventListener('click', downloadBehaviorReport);

  function clearSession() {
    localStorage.removeItem('discParticipantName');
    localStorage.removeItem('discParticipantBirth');
    localStorage.removeItem('discQuizMode');
    navigateTo('index.html');
  }

  if (participant) {
    displayName.textContent = participant;
    startNote.style.display = 'none';
  } else {
    displayName.textContent = 'Visitante';
    startNote.style.display = 'block';
  }

  if (state.selectedMode) {
    setMode(state.selectedMode);
  }

  updateBeginButton();
  resetToSelection();
}
