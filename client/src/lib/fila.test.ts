import { describe, expect, it } from "vitest";
import { Paciente, StatusPaciente } from "@/types";
import {
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

  it("conta os dias desde a Data de Admissão", () => {
    expect(diasDeEspera("27/10/2026", hoje)).toBe(0);
    expect(diasDeEspera("26/09/2026", hoje)).toBe(31);
    expect(formatarEspera("26/10/2026", hoje)).toBe("1 dia");
    expect(formatarEspera("27/10/2025", hoje)).toBe("365 dias");
  });

  it("mostra '-' para data vazia, inválida ou futura", () => {
    expect(formatarEspera("", hoje)).toBe("-");
    expect(formatarEspera("10/2026", hoje)).toBe("-");
    expect(formatarEspera("28/10/2026", hoje)).toBe("-");
  });

  it("formata hoje como DD/MM/AAAA", () => {
    expect(hojeFormatado(hoje)).toBe("27/10/2026");
  });
});
