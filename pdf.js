window.addEventListener('DOMContentLoaded', () => {
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', () => {
      exportReportToPDF();
    });
  }
});

function exportReportToPDF() {
  // Inicializa a biblioteca jsPDF instalada no sistema
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Recupera os dados do participante e do laudo guardados no navegador
  const name = localStorage.getItem('discParticipantName') || 'Visitante';
  const birth = localStorage.getItem('discParticipantBirth') || '';
  const rawReport = localStorage.getItem('discAiReport');

  if (!rawReport) {
    alert('Nenhum relatório encontrado para exportar.');
    return;
  }

  // Limpa caracteres de formatação pesada do Markdown antes de jogar no PDF
  function cleanTextForPdf(text) {
    let cleaned = String(text || '');
    cleaned = cleaned.replace(/\*+/g, ''); // Remove asteriscos de negrito
    cleaned = cleaned.replace(/#+\s+/g, ''); // Remove hashtags de títulos
    return cleaned.trim();
  }

  const reportText = cleanTextForPdf(rawReport);

  // CONFIGURAÇÕES DE PÁGINA (Medidas oficiais do papel A4 em milímetros)
  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 20; // Margem lateral de 2cm
  const maxLineWidth = pageWidth - (margin * 2); // Largura máxima do texto: 170mm
  
  let y = margin; // Controla a altura atual da "caneta" de escrita

  // --- DESIGN DO CABEÇALHO (PÁGINA 1) ---
  // Cria uma faixa colorida no topo usando a cor base do sistema (#5244a8)
  doc.setFillColor(82, 68, 168); 
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Texto do título dentro da faixa
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('LAUDO COMPORTAMENTAL DISC', margin, 18);

  // Metadados do participante
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Participante: ${name} ${birth ? `| Nascimento: ${birth}` : ''}`, margin, 28);

  // Posiciona a caneta para começar o texto abaixo da faixa do cabeçalho
  y = 54;

  // Configura a cor e tamanho padrão para o corpo do texto (Cinza escuro para melhor leitura)
  doc.setTextColor(45, 45, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  const lineHeight = 6.5; // Distância entre as linhas em milímetros

  // Divide o texto por quebras de linha para preservar os parágrafos originais da IA
  const paragraphs = reportText.split('\n');

  paragraphs.forEach((para) => {
    const trimmedPara = para.trim();
    if (!trimmedPara) {
      y += 4; // Se for um parágrafo vazio, apenas pula um espaço sutil
      return;
    }

    // A MÁGICA: Quebra o parágrafo longo em um array de linhas curtas que cabem na página
    const lines = doc.splitTextToSize(trimmedPara, maxLineWidth);

    lines.forEach((line) => {
      // VERIFICAÇÃO ANTI-CORTE: Se a próxima linha estourar a margem de segurança do fundo (20mm)...
      if (y + lineHeight > (pageHeight - margin)) {
        doc.addPage(); // Cria uma nova folha em branco automaticamente
        y = margin + 10; // Reinicia a caneta no topo da folha nova dando um espaçamento
        
        // Adiciona um rodapé discreto indicando a continuidade do documento
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(`Relatório DISC • ${name} • Página de Continuidade`, margin, pageHeight - 10);
        
        // Devolve as configurações de cor e fonte do texto principal
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(45, 45, 45);
      }

      // Aplica um leve negrito mecânico se a linha parecer um título de seção (ex: "1) Resumo...")
      if (/^\d\)/.test(line) || (line.toUpperCase() === line && line.length > 5)) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, margin, y);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(line, margin, y);
      }

      // Desce a caneta para a próxima linha
      y += lineHeight;
    });

    y += 2.5; // Dá um espaço extra sutil ao finalizar cada bloco de parágrafo completo
  });

  // Finaliza gerando o download do arquivo nomeado dinamicamente
  doc.save(`Relatorio_DISC_${name.replace(/\s+/g, '_')}.pdf`);
}