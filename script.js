if (pageType === 'login') {
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
