// Traduz o erro do Supabase em um aviso simples para quem usa o sistema
export function mensagemDeErro(error: unknown): string {
  const { code, message } = (error ?? {}) as {
    code?: string;
    message?: string;
  };
  const texto = message ?? "";

  // 42703 = coluna inexistente no Postgres; PGRST204 = coluna fora do cache da API
  if (code === "42703" || code === "PGRST204")
    return "Não foi possível salvar: o banco de dados está desatualizado (faltam colunas novas). Avise o responsável pelo sistema. Nada foi alterado.";
  if (/failed to fetch|network|load failed/i.test(texto))
    return "Não foi possível salvar: sem conexão com a internet. Nada foi alterado, tente de novo.";
  if (code === "42501" || /permission|jwt|unauthorized/i.test(texto))
    return "Não foi possível salvar: o servidor recusou a permissão. Avise o responsável pelo sistema. Nada foi alterado.";
  return `Não foi possível salvar no servidor. Nada foi alterado.${texto ? ` Detalhe: ${texto}` : ""}`;
}
