const pageType = document.body.dataset.page;

const questions = [
  {
    question: 'Quando chega um novo desafio, como você se posiciona?',
    options: [
      { label: 'Assumo a frente e foco no resultado rapidamente.', disc: 'D', value: 12 },
      { label: 'Busco motivar as pessoas antes de decidir.', disc: 'I', value: 12 },
      { label: 'Procuro garantir calma e confiança no grupo.', disc: 'S', value: 12 },
      { label: 'Analiso os dados e sigo o processo correto.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Em uma reunião, o que mais chama sua atenção?',
    options: [
      { label: 'Os objetivos claros e o cronograma definido.', disc: 'D', value: 12 },
      { label: 'A energia e o entusiasmo das pessoas.', disc: 'I', value: 12 },
      { label: 'A segurança e previsibilidade do plano.', disc: 'S', value: 12 },
      { label: 'A precisão dos detalhes e a qualidade técnica.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Quando alguém conta uma ideia, qual reação é mais natural?',
    options: [
      { label: 'Avalio se tem impacto e posso agir agora.', disc: 'D', value: 12 },
      { label: 'Imagino como isso vai inspirar outras pessoas.', disc: 'I', value: 12 },
      { label: 'Quero saber se dá para manter o equilíbrio.', disc: 'S', value: 12 },
      { label: 'Busco confirmar se está correto nos mínimos detalhes.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Quando algo sai do esperado, você tende a:',
    options: [
      { label: 'Corrigir com velocidade e seguir adiante.', disc: 'D', value: 12 },
      { label: 'Tranquilizar a equipe e manter confiança.', disc: 'I', value: 12 },
      { label: 'Ajustar o ritmo para não quebrar o fluxo.', disc: 'S', value: 12 },
      { label: 'Revisar o processo para evitar novos erros.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'O que mais te motiva no trabalho diário?',
    options: [
      { label: 'Conquistar metas e avançar rápido.', disc: 'D', value: 12 },
      { label: 'Criar conexão e ser reconhecido.', disc: 'I', value: 12 },
      { label: 'Manter estabilidade e apoio mútuo.', disc: 'S', value: 12 },
      { label: 'Fazer o melhor com precisão e cuidado.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Como você prefere delegar tarefas?',
    options: [
      { label: 'Dando metas claras e responsabilidade imediata.', disc: 'D', value: 12 },
      { label: 'Convidando a equipe a participar com entusiasmo.', disc: 'I', value: 12 },
      { label: 'Distribuindo em etapas seguras e estáveis.', disc: 'S', value: 12 },
      { label: 'Definindo padrões e verificando a qualidade.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Quando alguém pede sua opinião, você geralmente:',
    options: [
      { label: 'Foco no que precisa ser feito agora.', disc: 'D', value: 12 },
      { label: 'Incentivo e compartilho ideias com calor.', disc: 'I', value: 12 },
      { label: 'Procuro ouvir com paciência antes de responder.', disc: 'S', value: 12 },
      { label: 'Forneço uma análise cuidadosa e detalhada.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Para você, um bom planejamento é:',
    options: [
      { label: 'Levar o projeto à frente com foco e velocidade.', disc: 'D', value: 12 },
      { label: 'Aproveitar oportunidades criativas em equipe.', disc: 'I', value: 12 },
      { label: 'Assegurar consistência e apoio ao longo do tempo.', disc: 'S', value: 12 },
      { label: 'Organizar regras, padrão e controle de qualidade.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Você fica mais satisfeito quando:',
    options: [
      { label: 'Os resultados aparecem rápido e com impacto.', disc: 'D', value: 12 },
      { label: 'A equipe celebra a trajetória junto com você.', disc: 'I', value: 12 },
      { label: 'O ambiente segue com segurança e confiança.', disc: 'S', value: 12 },
      { label: 'Tudo foi revisado e está tecnicamente correto.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Em um projeto, o que você mais quer evitar?',
    options: [
      { label: 'Perder tempo e deixar a ação estagnar.', disc: 'D', value: 12 },
      { label: 'Perder o clima positivo entre as pessoas.', disc: 'I', value: 12 },
      { label: 'Causar tensão e instabilidade no grupo.', disc: 'S', value: 12 },
      { label: 'Fazer algo impreciso ou fora do padrão.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Com mudanças rápidas, você prefere:',
    options: [
      { label: 'Tomar as rédeas e ajustar imediatamente.', disc: 'D', value: 12 },
      { label: 'Conversar com todos e manter o ânimo.', disc: 'I', value: 12 },
      { label: 'Apoiar quem sente insegurança no processo.', disc: 'S', value: 12 },
      { label: 'Verificar cada ajuste antes de avançar.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Quando precisa entregar algo, você prefere:',
    options: [
      { label: 'Entregar rápido e cumprir o objetivo.', disc: 'D', value: 12 },
      { label: 'Fazer com entusiasmo e boa comunicação.', disc: 'I', value: 12 },
      { label: 'Fazer em um ritmo previsível e seguro.', disc: 'S', value: 12 },
      { label: 'Revisar cada detalhe antes de finalizar.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Qual ambiente te deixa mais confortável?',
    options: [
      { label: 'Competitivo e objetivo.', disc: 'D', value: 12 },
      { label: 'Social e inspirador.', disc: 'I', value: 12 },
      { label: 'Calmo e confiável.', disc: 'S', value: 12 },
      { label: 'Organizado e detalhado.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Qual estilo combina mais com você em um debate?',
    options: [
      { label: 'Fono firme e direto para resolver.', disc: 'D', value: 12 },
      { label: 'Tom amigável e persuasivo.', disc: 'I', value: 12 },
      { label: 'Tom ponderado e conciliador.', disc: 'S', value: 12 },
      { label: 'Tom técnico e embasado.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'No final do dia, você prefere sentir que:',
    options: [
      { label: 'Os objetivos foram atingidos com ganho.', disc: 'D', value: 12 },
      { label: 'As pessoas saíram motivadas.', disc: 'I', value: 12 },
      { label: 'Tudo ficou estável e previsível.', disc: 'S', value: 12 },
      { label: 'O trabalho está correto e sem falhas.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Como você lida com prazos apertados?',
    options: [
      { label: 'Acelero o ritmo para cumprir tudo.', disc: 'D', value: 12 },
      { label: 'Reúno o grupo e falo com confiança.', disc: 'I', value: 12 },
      { label: 'Mantenho calma e apoio quem precisa.', disc: 'S', value: 12 },
      { label: 'Organizo cada etapa para não esquecer nada.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Na hora de aprender algo novo, você prefere:',
    options: [
      { label: 'Colocar em prática o mais rápido possível.', disc: 'D', value: 12 },
      { label: 'Trocar ideias com outras pessoas.', disc: 'I', value: 12 },
      { label: 'Aprimorar com passos seguros.', disc: 'S', value: 12 },
      { label: 'Estudar cada regra com cuidado.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Seu estilo de feedback tende a ser:',
    options: [
      { label: 'Direto e voltado à ação.', disc: 'D', value: 12 },
      { label: 'Caloroso e encorajador.', disc: 'I', value: 12 },
      { label: 'Suave e compreensivo.', disc: 'S', value: 12 },
      { label: 'Preciso e baseado em dados.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Quando avalia um resultado, você olha primeiro para:',
    options: [
      { label: 'O quanto foi eficaz e imediato.', disc: 'D', value: 12 },
      { label: 'O impacto na equipe e no clima.', disc: 'I', value: 12 },
      { label: 'A sustentabilidade ao longo do tempo.', disc: 'S', value: 12 },
      { label: 'A exatidão e consistência técnica.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Como você prefere trabalhar em equipe?',
    options: [
      { label: 'Com metas claras e decisões rápidas.', disc: 'D', value: 12 },
      { label: 'Com interação constante e criatividade.', disc: 'I', value: 12 },
      { label: 'Com apoio mútuo e rotinas estáveis.', disc: 'S', value: 12 },
      { label: 'Com padrões e revisão técnica rigorosa.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Como você prefere iniciar um projeto?',
    options: [
      { label: 'Agindo rápido e com foco.', disc: 'D', value: 12 },
      { label: 'Reunindo pessoas para trocar ideias.', disc: 'I', value: 12 },
      { label: 'Construindo confiança antes de avançar.', disc: 'S', value: 12 },
      { label: 'Desenvolvendo o plano com precisão.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Se um plano precisa mudar, você prefere:',
    options: [
      { label: 'Implementar a nova direção imediatamente.', disc: 'D', value: 12 },
      { label: 'Comunicar a todos e manter o espírito alto.', disc: 'I', value: 12 },
      { label: 'Apoiar a transição com cuidado.', disc: 'S', value: 12 },
      { label: 'Verificar se a mudança é justificada.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Qual frase descreve melhor quem você é?',
    options: [
      { label: 'Preciso de ação e resultados.', disc: 'D', value: 12 },
      { label: 'Preciso de reconhecimento social.', disc: 'I', value: 12 },
      { label: 'Preciso de harmonia e segurança.', disc: 'S', value: 12 },
      { label: 'Preciso de estrutura e precisão.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Quando delega tarefas, você prefere:',
    options: [
      { label: 'Dar autonomia para executar rápido.', disc: 'D', value: 12 },
      { label: 'Deixar a pessoa à vontade para criar.', disc: 'I', value: 12 },
      { label: 'Acompanhar e apoiar passo a passo.', disc: 'S', value: 12 },
      { label: 'Oferecer regras claras e padrões.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Em decisões importantes, você confia mais em:',
    options: [
      { label: 'Sua intuição e liderança.', disc: 'D', value: 12 },
      { label: 'Sua rede e experiências sociais.', disc: 'I', value: 12 },
      { label: 'Seu senso de estabilidade e consenso.', disc: 'S', value: 12 },
      { label: 'Seus dados e critérios objetivos.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Se algo fosse mal explicado, você:',
    options: [
      { label: 'Interrompe e segue direto ao ponto.', disc: 'D', value: 12 },
      { label: 'Faz perguntas com alegria.', disc: 'I', value: 12 },
      { label: 'Diz com calma como deve ser.', disc: 'S', value: 12 },
      { label: 'Pede detalhes para não errar.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'A melhor equipe para você combina:',
    options: [
      { label: 'Direção, foco e ação contínua.', disc: 'D', value: 12 },
      { label: 'Criatividade, sociabilidade e entusiasmo.', disc: 'I', value: 12 },
      { label: 'Estabilidade, apoio e confiança.', disc: 'S', value: 12 },
      { label: 'Organização, precisão e controle.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'O que faz você se sentir mais produtivo?',
    options: [
      { label: 'Avançar com decisões firmes.', disc: 'D', value: 12 },
      { label: 'Trocar ideias com outras pessoas.', disc: 'I', value: 12 },
      { label: 'Manter continuidade sem surpresas.', disc: 'S', value: 12 },
      { label: 'Concluir algo com excelência técnica.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Você prefere liderar com:',
    options: [
      { label: 'Força, clareza e determinação.', disc: 'D', value: 12 },
      { label: 'Carisma, entusiasmo e conexão.', disc: 'I', value: 12 },
      { label: 'Apoio, rotina e confiança.', disc: 'S', value: 12 },
      { label: 'Critério, precisão e lógica.', disc: 'C', value: 12 }
    ]
  },
  {
    question: 'Quando o ambiente é incerto, você gosta de:',
    options: [
      { label: 'Guiar com atitude e objetivo claro.', disc: 'D', value: 12 },
      { label: 'Manter a equipe motivada e positiva.', disc: 'I', value: 12 },
      { label: 'Cuidar para que o grupo se sinta seguro.', disc: 'S', value: 12 },
      { label: 'Buscar regras e fatos para sustentar a decisão.', disc: 'C', value: 12 }
    ]
  }
];

const quizModes = {
  simple: 15,
  medium: 20,
  complete: 30
};

const modeLabel = {
  simple: 'Simples',
  medium: 'Médio',
  complete: 'Completo'
};

const discDescriptions = {
  D: 'Dominância representa foco em ação, resultado e autonomia. Pessoas D são decisoras naturais, orientadas a metas, que assumem responsabilidade e buscam impacto rápido. Elas prosperam em ambientes de desafio e controle, mas podem precisar desacelerar para ouvir perspectivas complementares.',
  I: 'Influência representa energia social, persuasão e entusiasmo. Pessoas I inspiram através de comunicação, conexão e emoção, criando redes colaborativas e impulsionando o engajamento do time. Elas valorizam reconhecimento e criatividade, sendo mais eficazes quando equilibram entusiasmo com estrutura.',
  S: 'Estabilidade representa apoio, confiança e constância. Pessoas S oferecem confiabilidade, empatia e colaboração, criando ambientes seguros e sustentáveis. Elas tendem a preservar harmonia e rotina, mas devem desenvolver flexibilidade diante de mudanças inevitáveis.',
  C: 'Conformidade representa precisão, análise e respeito a normas. Pessoas C buscam qualidade, consistência e dados rigorosos, garantindo que processos e entregas estejam corretos. Elas se destacam em controle de risco e melhoria contínua, mas podem equilibrar a busca pela perfeição com maior agilidade.'
};

const discTitle = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade'
};

function pageTransition() {
  requestAnimationFrame(() => {
    document.body.classList.remove('page-enter');
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function navigateTo(url) {
  document.body.classList.add('page-exit');
  setTimeout(() => {
    window.location.href = url;
  }, 320);
}
