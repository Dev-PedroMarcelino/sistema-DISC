if (typeof pageType !== 'undefined' && pageType === 'login') {
  pageTransition();
  const userNameInput = document.getElementById('userName');
  const userBirthInput = document.getElementById('userBirth');
  const startQuiz = document.getElementById('startQuiz');

  startQuiz.addEventListener('click', () => {
    const nameValue = userNameInput.value.trim();
    const birthValue = userBirthInput.value;
    if (!nameValue || !birthValue) {
      alert('Por favor, preencha seu nome e data de nascimento.');
      return;
    }
    localStorage.setItem('discParticipantName', nameValue);
    localStorage.setItem('discParticipantBirth', birthValue);
    localStorage.removeItem('discQuizMode');
    navigateTo('questionario.html');
  });
}

// --- CONTROLE DA NOVA TELA DEDICADA DO RELATÓRIO IA ---
const openReportBtn = document.getElementById('openReportBtn');

if (openReportBtn) {
  openReportBtn.addEventListener('click', () => {
    // Abrir em uma nova aba é a melhor prática técnica porque preserva o estado 
    // das variáveis locais, o gráfico radar e o progresso na tela anterior!
    window.open('relatorio.html', '_blank');
  });
}