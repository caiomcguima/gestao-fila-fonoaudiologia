import { describe, expect, it } from "vitest";
import { mensagemDeErro } from "./erroSupabase";

describe("mensagemDeErro", () => {
  it("coluna faltando no banco vira aviso de banco desatualizado", () => {
    for (const code of ["42703", "PGRST204"])
      expect(mensagemDeErro({ code, message: "x" })).toContain("desatualizado");
  });

  it("falha de rede vira aviso de sem conexão", () => {
    expect(mensagemDeErro({ message: "TypeError: Failed to fetch" })).toContain(
      "sem conexão"
    );
  });

  it("recusa de permissão vira aviso de permissão", () => {
    expect(mensagemDeErro({ code: "42501", message: "x" })).toContain(
      "permissão"
    );
  });

  it("erro desconhecido mostra o detalhe; sem detalhe, só o aviso", () => {
    expect(mensagemDeErro({ message: "algo raro" })).toContain("algo raro");
    expect(mensagemDeErro(undefined)).not.toContain("Detalhe");
  });
});
