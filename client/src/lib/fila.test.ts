import { describe, expect, it } from "vitest";
import { Paciente, StatusPaciente } from "@/types";
import {
  ajusteDeEspera,
  diasDeEspera,
  formatarEspera,
  hojeFormatado,
  numerarPorStatus,
  ordenarParaExibicao,
} from "./fila";

const p = (
  id: string,
  status: StatusPaciente,
  data: string,
  created_at = ""
): Paciente => ({
  id,
  status,
  data,
  created_at,
  nome: id,
  telefone: "",
  dataNascimento: "",
  cpf: "",
  cns: "",
  ubs: "",
});

describe("fila", () => {
  const lista = [
    p("c", "Aguardando", "10/02/2025"),
    p("a", "Aguardando", "05/01/2025"),
    p("x", "Alta", "01/01/2024"),
    p("b", "Aguardando", "10/02/2025", "2025-02-10T09:00:00Z"),
    p("d", "Aguardando", ""),
    p("y", "Alta", "02/01/2024"),
  ];

  it("numera cada status separadamente pela data de entrada", () => {
    const n = numerarPorStatus(lista);
    // b e c têm a mesma data: desempata por created_at (c sem created_at vem antes); d sem data vai para o fim
    expect(["a", "c", "b", "d"].map(id => n.get(id))).toEqual([1, 2, 3, 4]);
    expect([n.get("x"), n.get("y")]).toEqual([1, 2]);
  });

  it("recalcula as posições quando alguém sai de Aguardando", () => {
    const semA = lista.map(x =>
      x.id === "a" ? { ...x, status: "Alta" as const } : x
    );
    const n = numerarPorStatus(semA);
    expect(["c", "b", "d"].map(id => n.get(id))).toEqual([1, 2, 3]);
    expect(n.get("a")).toBe(3); // entra em Alta depois de x e y (2024)
  });

  it("agrupa por status na ordem de STATUS_LIST", () => {
    expect(ordenarParaExibicao(lista).map(x => x.id)).toEqual([
      "a",
      "c",
      "b",
      "d",
      "x",
      "y",
    ]);
  });
});

describe("tempo de espera", () => {
  const hoje = new Date(2026, 9, 27); // 27/10/2026
  const aguardando = p("e", "Aguardando", "26/09/2026");

  it("conta os dias desde a Data de Admissão enquanto aguarda", () => {
    expect(diasDeEspera(aguardando, hoje)).toBe(31);
    expect(formatarEspera(p("e", "Aguardando", "26/10/2026"), hoje)).toBe(
      "1 dia"
    );
  });

  it("mostra '-' para data vazia, inválida ou futura", () => {
    for (const data of ["", "10/2026", "28/10/2026"])
      expect(formatarEspera(p("e", "Aguardando", data), hoje)).toBe("-");
  });

  it("pausa ao sair de Aguardando e retoma descontando a pausa", () => {
    // sai da fila em 06/10 (10 dias de espera)
    const saiu = {
      ...aguardando,
      status: "Em Atendimento" as const,
      ...ajusteDeEspera(aguardando, "Em Atendimento", new Date(2026, 9, 6)),
    };
    expect(saiu.esperaPausadaEm).toBe("06/10/2026");
    expect(formatarEspera(saiu, hoje)).toBe("10 dias (pausado)");
    // troca entre status fora da fila não mexe na pausa
    expect(ajusteDeEspera(saiu, "Alta", hoje)).toEqual({});

    // volta para a fila em 16/10 (10 dias pausado) e conta de novo até 27/10
    const voltou = {
      ...saiu,
      status: "Aguardando" as const,
      ...ajusteDeEspera(saiu, "Aguardando", new Date(2026, 9, 16)),
    };
    expect(voltou).toMatchObject({ esperaPausadaEm: null, diasPausados: 10 });
    expect(diasDeEspera(voltou, hoje)).toBe(21);
  });

  it("paciente novo cadastrado fora da fila já nasce pausado", () => {
    expect(ajusteDeEspera(undefined, "Alta", hoje)).toEqual({
      esperaPausadaEm: "27/10/2026",
    });
    expect(ajusteDeEspera(undefined, "Aguardando", hoje)).toEqual({});
  });

  it("paciente antigo sem data de pausa usa a data da alta", () => {
    const antigo = { ...p("e", "Alta", "26/09/2026"), dataAlta: "01/10/2026" };
    expect(formatarEspera(antigo, hoje)).toBe("5 dias (pausado)");
    expect(formatarEspera(p("e", "Desistência", "26/09/2026"), hoje)).toBe("-");
  });

  it("formata hoje como DD/MM/AAAA", () => {
    expect(hojeFormatado(hoje)).toBe("27/10/2026");
  });
});
