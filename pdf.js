window.generatePdfReport = function({ participant, birth, mode, quizLength, analysisText, lastResultData, modeLabel }) {
  const jsPDFConstructor = window.jspdf?.jsPDF;
  if (!jsPDFConstructor) {
    alert('Biblioteca jsPDF não encontrada. Não é possível gerar PDF.');
    return;
  }

  const doc = new jsPDFConstructor({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const maxWidth = 515;
  let y = 50;

  // Capa elegante
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
  doc.text(`Modo: ${modeLabel[mode] || mode || 'N/A'} (${quizLength} perguntas)`, margin, y);
  y += 26;

  const cleaned = String(analysisText || '')
    .replace(/\*?\(Nota de RH:[\s\S]*?\)\*?/gi, '')
    .replace(/Nota de RH:[\s\S]*$/gi, '')
    .replace(/[#*]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();

  const analysisTitle = 'Análise de perfil e recomendações';
  doc.setTextColor(38, 50, 56);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(analysisTitle, margin, y);
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

  Object.entries(lastResultData.percentages || { D: 0, I: 0, S: 0, C: 0 }).forEach(([letter, value]) => {
    const color = colors[letter] || [55, 65, 81];
    if (Array.isArray(color)) doc.setTextColor(...color);
    else doc.setTextColor(color);
    doc.setFont('helvetica', 'bold');
    doc.text(`${letter}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 37, 41);
    doc.text(`${value}%`, margin + 50, y);
    y += 18;
  });

  const noteText = Object.values(lastResultData.percentages || {}).some(v => Number.isFinite(v) && v > 0)
    ? ''
    : 'Nota: não foram obtidos percentuais completos no sistema. Esse relatório prioriza análise qualitativa das tendências observadas.';

  if (noteText) {
    y += 10;
    doc.setTextColor(95, 99, 104);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const noteLines = doc.splitTextToSize(noteText, maxWidth);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 14;
  }

  const fileName = `analise-comportamental-${participant.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
