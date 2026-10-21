import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Paciente } from "@/types";

export interface LinhaPDF {
  paciente: Paciente;
  numero?: number; // Nº/posição; vazio quando não se aplica
}

// A4 paisagem, em mm
const MARGEM = 10;
const FONTE_CORPO = 10; // pt (o PDF antigo saía com ~5pt efetivos)
const TOPO_TABELA = 24; // espaço para o título repetido em cada página

type Coluna = {
  header: string;
  valor: (l: LinhaPDF) => string;
  largura?: number;
};

function colunasVisiveis(linhas: LinhaPDF[]): Coluna[] {
  const variosStatus = new Set(linhas.map(l => l.paciente.status)).size > 1;
  const temProfissional = linhas.some(l => l.paciente.profissional);
  const colunas: (Coluna | false)[] = [
    {
      header: "Nº",
      valor: l => (l.numero ? String(l.numero) : "-"),
      largura: 12,
    },
    { header: "Nome", valor: l => l.paciente.nome },
    { header: "Telefone", valor: l => l.paciente.telefone, largura: 30 },
    { header: "Data", valor: l => l.paciente.data, largura: 22 },
    { header: "UBS", valor: l => l.paciente.ubs },
    { header: "CPF", valor: l => l.paciente.cpf, largura: 29 },
    { header: "CNS", valor: l => l.paciente.cns, largura: 39 },
    variosStatus && {
      header: "Status",
      valor: l => l.paciente.status,
      largura: 27,
    },
    temProfissional && {
      header: "Profissional",
      valor: l => l.paciente.profissional || "-",
    },
    { header: "Diagnóstico", valor: l => l.paciente.diagnostico || "-" },
  ];
  return colunas.filter((c): c is Coluna => Boolean(c));
}

export function gerarPDF(linhas: LinhaPDF[], titulo: string): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const geradoEm = new Date().toLocaleString("pt-BR");
  const colunas = colunasVisiveis(linhas);

  autoTable(doc, {
    head: [colunas.map(c => c.header)],
    body: linhas.map(l => colunas.map(c => c.valor(l))),
    margin: { top: TOPO_TABELA, left: MARGEM, right: MARGEM, bottom: 14 },
    tableWidth: "auto",
    showHead: "everyPage",
    rowPageBreak: "avoid",
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: FONTE_CORPO,
      textColor: 0,
      fillColor: 255,
      lineColor: 0,
      lineWidth: 0.2,
      cellPadding: 1.5,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fontStyle: "bold",
      fillColor: 230,
      textColor: 0,
      lineWidth: 0.4,
    },
    columnStyles: Object.fromEntries(
      colunas.map((c, i) => [i, c.largura ? { cellWidth: c.largura } : {}])
    ),
    didDrawPage: () => {
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(`Fila de Fonoaudiologia — ${titulo}`, MARGEM, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${linhas.length} paciente(s)`, largura - MARGEM, 15, {
        align: "right",
      });
      doc.setFontSize(9);
      doc.text(`Gerado em ${geradoEm}`, MARGEM, altura - 6);
      doc.text(
        `Página ${doc.getNumberOfPages()} de {total}`,
        largura - MARGEM,
        altura - 6,
        {
          align: "right",
        }
      );
    },
  });

  doc.putTotalPages("{total}");
  return doc;
}

export async function exportarParaPDF(linhas: LinhaPDF[], titulo: string) {
  const slug = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  gerarPDF(linhas, titulo).save(`fila_fonoaudiologia_${slug}.pdf`);
}
