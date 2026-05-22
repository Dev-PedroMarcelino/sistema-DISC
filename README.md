# 🧠 Sistema de Avaliação Comportamental DISC com Inteligência Artificial

Bem-vindo ao repositório oficial da **Plataforma Avançada de Avaliação Comportamental DISC**. Este sistema foi desenvolvido para oferecer uma experiência premium, interativa e fluida na aplicação e análise do teste psicométrico DISC (Dominância, Influência, Estabilidade e Conformidade). 

O projeto combina uma arquitetura moderna de frontend com o poder de processamento de **Inteligência Artificial Generativa (Google Gemini API)** para produzir laudos de RH profundos, assertivos e personalizados em tempo real, além de exportar relatórios multipáginas formatados em PDF.

---

## 🎯 Proposta do Sistema

O objetivo principal desta plataforma é mapear tendências comportamentais de candidatos e colaboradores de forma estratégica, indo além de uma simples etiqueta ou pontuação fria. O sistema avalia a intensidade relativa de cada vetor e traduz esses dados em narrativas acionáveis para processos de recrutamento e seleção, desenvolvimento de lideranças, engenharia de equipes (*team building*) e gestão de clima organizacional.

---

## ✨ Funcionalidades Principais

1. **Design Responsivo Avançado (Mobile-First & Desktop Glass)**
   * **Mobile:** Interface limpa, focada em toque, com transições suaves e elementos empilhados de maneira ergonômica.
   * **Desktop (PC):** Layout exclusivo em formato **"Livro Aberto"** via Flexbox inteligente, que unifica a seleção de modos e o painel de perguntas no centro do monitor, eliminando rolagens verticais desnecessárias e agrupando os componentes de forma compacta.
   * **Estética Premium:** Identidade visual baseada no conceito de *Glassmorphism*, trazendo fundos em degradê profundo (Roxo vibrante para Preto sofisticado), cartões translúcidos com efeito de desfoque de fundo (`backdrop-filter`) e quinas elegantemente arredondadas (`border-radius: 24px`) com bordas brancas sutis.

2. **Três Modos de Questionário**
   * **Simples (15 perguntas):** Ideal para triagens rápidas ou demonstrações.
   * **Médio (20 perguntas):** Equilíbrio ideal entre tempo de preenchimento e precisão.
   * **Completo (30 perguntas):** Análise detalhada de alta fidelidade para mapeamentos profundos de liderança.

3. **Algoritmo de Análise de Equilíbrio / Perfis Combinados**
   * O sistema analisa os resultados matemáticos e identifica o primeiro e o segundo lugar.
   * Caso a diferença entre o perfil primário e o secundário seja **menor ou igual a 5%**, o sistema reconhece um **Perfil Combinado (Equilíbrio)** e instrui a IA a gerar um laudo focado nessa mistura exata, explicando como as duas características interagem na personalidade do indivíduo.

4. **Engine de Captura Segura de Dados (HTML Scraper)**
   * Para evitar falhas de comunicação e perda de estado entre os arquivos JavaScript, a IA extrai os dados diretamente dos elementos finais renderizados na tela do usuário (`percentD`, `percentI`, etc.), garantindo fidelidade absoluta com os gráficos exibidos.

5. **Página Dedicada de Relatório (`relatorio.html`)**
   * Isolamento do laudo extenso em uma nova janela de navegação, garantindo performance fluida, scroll nativo do dispositivo sem travamentos e preservação total do estado do gráfico na tela anterior.

6. **Exportador Multicritério para PDF (`pdf.js`)**
   * Paginação matemática automatizada que monitora a altura física da página A4 (297mm).
   * Sistema anti-corte que quebra parágrafos em linhas, cria novas páginas dinamicamente e injeta rodapés personalizados de continuidade sem interrupções abruptas no texto.

---

## 📂 Estrutura de Arquivos do Projeto

* `index.html`: Tela de autenticação e coleta de metadados do participante (Nome e Data de Nascimento).
* `questionario.html`: Estrutura mestre do teste, contendo o card unificado (`unified-quiz-card`) e as telas de resultado.
* `info.html`: Página explicativa ("Conheça +") detalhando a teoria DISC, otimizada com imagens SVG integradas e alinhadas.
* `relatorio.html`: Ambiente isolado e focado em leitura para exibição do laudo gerado pela Inteligência Artificial.
* `styles.css`: Toda a inteligência visual, variáveis de cor, regras de mídia para computadores e efeitos de vidro/degradê.
* `quiz-data.js`: Banco de dados contendo o banco de perguntas, alternativas e pesos de cada vetor DISC.
* `quiz-ui.js`: Lógica de transição de perguntas, marcação de respostas, somatória e renderização do gráfico radar.
* `script.js`: Gerenciamento de login, transições de página globais e gatilhos de abertura da janela de laudo.
* `ai.js`: Comunicação com o modelo de IA, engenharia de prompt dinâmico (perfil único vs. combinado) e higienização de Markdown.
* `pdf.js`: Driver do `jsPDF` configurado com margens de segurança, faixas de cabeçalho corporativas e paginação fluida.

---

## 🚀 Como Inserir sua Chave de API para Testes Locais

Originalmente, o projeto foi arquitetado para rodar em produção de forma segura através de uma API Serverless (`fetch('/api/gemini')`), protegendo a chave de acesso no servidor.

Se você clonou este projeto e deseja testá-lo ou demonstrá-lo diretamente no seu computador usando apenas a extensão **Live Server** do VS Code, você pode injetar sua chave temporária diretamente no frontend seguindo os passos abaixo:

### Passo 1: Obter a Chave do Google Gemini
1. Acesse o console do [Google AI Studio](https://aistudio.google.com/).
2. Faça login com sua conta do Google.
3. Clique em **"Get API Key"** e depois em **"Create API Key"**.
4. Copie o token gerado.

### Passo 2: Atualizar o Arquivo `ai.js`
Abra o arquivo `ai.js`, localize a função `window.onAiAnalysisRequested` e substitua o bloco do `try...catch` pelo código de requisição direta abaixo:

```javascript
window.onAiAnalysisRequested = async function(payload) {
  const analysisStatus = document.getElementById('analysisStatus');
  if (analysisStatus) analysisStatus.textContent = 'Preparando prompt para o modelo generativo...';

  // Captura os dados diretamente da tela
  const valD = parseFloat(document.getElementById('percentD')?.innerText || '0');
  const valI = parseFloat(document.getElementById('percentI')?.innerText || '0');
  const valS = parseFloat(document.getElementById('percentS')?.innerText || '0');
  const valC = parseFloat(document.getElementById('percentC')?.innerText || '0');
  const normalized = { D: valD, I: valI, S: valS, C: valC };

  const arrayPercentuais = Object.entries(normalized);
  arrayPercentuais.sort((a, b) => b[1] - a[1]);
  
  const letra1 = arrayPercentuais[0][0];
  const nota1 = arrayPercentuais[0][1];
  const letra2 = arrayPercentuais[1][0];
  const nota2 = arrayPercentuais[1][1];

  const diferenca = nota1 - nota2;
  const temPerfilEquilibrado = diferenca <= 5.0 && nota2 > 0;

  const nomesDisc = { 'D': 'Dominância', 'I': 'Influência', 'S': 'Estabilidade', 'C': 'Conformidade' };
  const nome1 = nomesDisc[letra1];
  const nome2 = nomesDisc[letra2];

  let instrucoesDaIA = temPerfilEquilibrado
    ? `O perfil primário é **${nome1}** com ${nota1}%, e o secundário é **${nome2}** com ${nota2}%. Explique a INTERAÇÃO E EQUILÍBRIO desses dois perfis.`
    : `O perfil predominante é **${nome1}** com ${nota1}%. Baseie a análise ESTRITAMENTE neste perfil.`;

  const prompt = `Atue como um analista de RH sênior. Gere um Relatório DISC oficial para: ${localStorage.getItem('discParticipantName') || 'Candidato'}.\\n\\nDados: D:${valD}%, I:${valI}%, S:${valS}%, C:${valC}%.\\n\\n${instrucoesDaIA}\\n\\nEstrutura:\\n1) Resumo\\n2) Pontos Fortes\\n3) Limitações\\n4) Plano de Ação.`;

  // === CÓDIGO DE CONEXÃO DIRETA PARA TESTES LOCAIS ===
  try {
    // INSIRA SUA CHAVE DO GEMINI NA LINHA ABAIXO 👇
    const API_KEY = 'SUA_CHAVE_AQUI_DE_FORMA_TEMPORARIA'; 

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (res.ok) {
      const json = await res.json();
      const text = json.candidates[0].content.parts[0].text || '';
      if (text) {
        window.deliverAiAnalysis(text);
        return;
      }
    }
    throw new Error('Erro na resposta da API');
  } catch (err) {
    console.error('AI request error:', err);
    if (analysisStatus) analysisStatus.textContent = 'Erro ao chamar a IA localmente.';
  }
};