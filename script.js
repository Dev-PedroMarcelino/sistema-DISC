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

// --- CONTROLE DA TELA CHEIA DO RELATÓRIO IA ---
const openReportBtn = document.getElementById('openReportBtn');
const closeReportBtn = document.getElementById('closeReportBtn');
const reportModal = document.getElementById('reportModal');

if (openReportBtn && closeReportBtn && reportModal) {
  // Evento de Abrir Tela Cheia
  openReportBtn.addEventListener('click', () => {
    reportModal.classList.add('visible');
    document.body.style.overflow = 'hidden'; // Trava a rolagem da página de fundo
  });

  // Evento de Fechar Tela Cheia
  closeReportBtn.addEventListener('click', () => {
    reportModal.classList.remove('visible');
    document.body.style.overflow = ''; // Devolve a rolagem normal para a página
  });
}