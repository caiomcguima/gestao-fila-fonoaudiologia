import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Paciente } from '@/types';

export async function exportarParaPDF(pacientes: Paciente[], nomeArquivo: string = 'fila_fonoaudiologia.pdf') {
  try {
    // Criar elemento HTML temporário com a tabela
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.backgroundColor = '#ffffff';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '10px';

    // Header
    const header = document.createElement('h1');
    header.textContent = 'GESTÃO DE FILA - FONOAUDIOLOGIA';
    header.style.textAlign = 'center';
    header.style.fontSize = '16px';
    header.style.marginBottom = '20px';
    header.style.color = '#005BAA';
    element.appendChild(header);

    // Data de geração
    const dataGeracao = document.createElement('p');
    dataGeracao.textContent = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
    dataGeracao.style.textAlign = 'right';
    dataGeracao.style.fontSize = '9px';
    dataGeracao.style.marginBottom = '10px';
    dataGeracao.style.color = '#666666';
    element.appendChild(dataGeracao);

    // Tabela
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';

    // Header da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#005BAA';
    headerRow.style.color = '#ffffff';

    const headers = ['#', 'Nome', 'Telefone', 'Data', 'UBS', 'CPF', 'CNS', 'Status', 'Profissional', 'Diagnóstico'];
    headers.forEach((headerText) => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.padding = '8px';
      th.style.textAlign = 'left';
      th.style.fontWeight = 'bold';
      th.style.fontSize = '9px';
      th.style.border = '1px solid #cccccc';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body da tabela
    const tbody = document.createElement('tbody');
    pacientes.forEach((paciente, index) => {
      const row = document.createElement('tr');
      row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';



      const cellsData = [
        (index + 1).toString(),
        paciente.nome,
        paciente.telefone,
        paciente.data,
        paciente.ubs,
        paciente.cpf,
        paciente.cns,
        paciente.status,
        paciente.profissional || '-',
        paciente.diagnostico || '-',
      ];

      cellsData.forEach((cellText) => {
        const td = document.createElement('td');
        td.textContent = cellText;
        td.style.padding = '6px';
        td.style.fontSize = '8px';
        td.style.border = '1px solid #cccccc';
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    element.appendChild(table);

    // Resumo
    const resumo = document.createElement('p');
    resumo.textContent = `Total de pacientes: ${pacientes.length}`;
    resumo.style.marginTop = '15px';
    resumo.style.fontSize = '9px';
    resumo.style.color = '#666666';
    element.appendChild(resumo);

    // Adicionar ao DOM temporariamente
    document.body.appendChild(element);

    // Converter para canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Remover do DOM
    document.body.removeChild(element);

    // Criar PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 297; // A4 landscape width em mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 210; // A4 landscape height em mm

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 210;
    }

    // Fazer download
    pdf.save(nomeArquivo);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  }
}
