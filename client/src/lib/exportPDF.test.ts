import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STATUS_LIST } from "@/types";
import { gerarPDF, LinhaPDF } from "./exportPDF";

// Dados fictícios (nenhum paciente real), com textos longos para forçar quebra de linha
const linhas: LinhaPDF[] = Array.from({ length: 160 }, (_, i) => ({
  numero: i + 1,
  paciente: {
    id: String(i),
    nome: `Paciente Fictício Com Nome Bem Comprido Número ${i + 1}`,
    telefone: "(31) 99999-9999",
    data: "01/01/2025",
    dataNascimento: "01/01/2015",
    cpf: "000.000.000-00",
    cns: "0000 0000 0000 0000",
    ubs: "UBS Unidade Básica de Saúde Centro",
    status: STATUS_LIST[i % STATUS_LIST.length],
    profissional: i % 2 ? "Tarciana Aparecida Rodrigues do Vale" : undefined,
    diagnostico: "Diagnóstico de teste ".repeat(9).trim(), // ~180 caracteres
  },
}));

describe("gerarPDF", () => {
  it("cabe na área de impressão com 160 linhas em várias páginas", () => {
    const doc = gerarPDF(linhas, "Teste");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tabela = (doc as any).lastAutoTable;
    const larguraTabela = tabela.columns.reduce(
      (s: number, c: { width: number }) => s + c.width,
      0
    );

    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(297, 0); // paisagem
    expect(larguraTabela).toBeLessThanOrEqual(297 - 20 + 0.01);
    expect(doc.getNumberOfPages()).toBeGreaterThan(5);
    expect(tabela.settings.showHead).toBe("everyPage");

    if (process.env.PDF_OUT)
      writeFileSync(
        process.env.PDF_OUT,
        Buffer.from(doc.output("arraybuffer"))
      );
  });
});
