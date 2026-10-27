import { Paciente, StatusPaciente, STATUS_LIST } from "@/types";

// "DD/MM/AAAA" -> "AAAAMMDD" para comparar como texto; data vazia ou inválida vai para o fim
function chaveData(data: string | undefined): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((data ?? "").trim());
  return m ? `${m[3]}${m[2]}${m[1]}` : "99999999";
}

// Ordem de entrada: campo "data", desempate por created_at e depois id
export function compararEntrada(a: Paciente, b: Paciente): number {
  return (
    chaveData(a.data).localeCompare(chaveData(b.data)) ||
    (a.created_at ?? "").localeCompare(b.created_at ?? "") ||
    a.id.localeCompare(b.id)
  );
}

// Status desconhecido (ex.: valor antigo no banco) vai para o fim
function indiceStatus(status: string): number {
  const i = (STATUS_LIST as readonly string[]).indexOf(status);
  return i === -1 ? STATUS_LIST.length : i;
}

// Agrupa por status (na ordem de STATUS_LIST) e, dentro do grupo, por ordem de entrada
export function ordenarParaExibicao(pacientes: Paciente[]): Paciente[] {
  return [...pacientes].sort(
    (a, b) =>
      indiceStatus(a.status) - indiceStatus(b.status) || compararEntrada(a, b)
  );
}

// Nº de cada paciente dentro do próprio status (1, 2, 3...), calculado na hora.
// Para "Aguardando" este número é a posição na fila.
export function numerarPorStatus(pacientes: Paciente[]): Map<string, number> {
  const contagem = new Map<string, number>();
  const numeros = new Map<string, number>();
  for (const p of [...pacientes].sort(compararEntrada)) {
    const n = (contagem.get(p.status) ?? 0) + 1;
    contagem.set(p.status, n);
    numeros.set(p.id, n);
  }
  return numeros;
}

export function contarPorStatus(pacientes: Paciente[]): Map<string, number> {
  const contagem = new Map<string, number>();
  for (const p of pacientes)
    contagem.set(p.status, (contagem.get(p.status) ?? 0) + 1);
  return contagem;
}

// "DD/MM/AAAA" -> dia em ms (UTC); undefined se inválida
function diaUTC(data: string | undefined): number | undefined {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((data ?? "").trim());
  return m ? Date.UTC(+m[3], +m[2] - 1, +m[1]) : undefined;
}

// Dias de "inicio" até "fim"; undefined se alguma data for inválida ou fim < inicio
function diasEntre(inicio: string | undefined, fim: string | undefined) {
  const a = diaUTC(inicio);
  const b = diaUTC(fim);
  if (a === undefined || b === undefined || b < a) return undefined;
  return Math.round((b - a) / 86_400_000);
}

// "Hoje" no formato DD/MM/AAAA
export function hojeFormatado(hoje = new Date()): string {
  return hoje.toLocaleDateString("pt-BR");
}

// Tempo de Espera: só conta em "Aguardando". Fora dele fica parado na data da pausa.
// Paciente antigo sem data de pausa: usa a data da alta, senão não dá para calcular.
export function diasDeEspera(
  p: Paciente,
  hoje = new Date()
): number | undefined {
  const fim =
    p.esperaPausadaEm ??
    (p.status === "Aguardando" ? hojeFormatado(hoje) : p.dataAlta);
  const dias = diasEntre(p.data, fim);
  return dias === undefined
    ? undefined
    : Math.max(0, dias - (p.diasPausados ?? 0));
}

export function formatarEspera(p: Paciente, hoje = new Date()): string {
  const dias = diasDeEspera(p, hoje);
  if (dias === undefined) return "-";
  const texto = dias === 1 ? "1 dia" : `${dias} dias`;
  return p.status === "Aguardando" ? texto : `${texto} (pausado)`;
}

// Campos a gravar junto com a troca de status para pausar/retomar o Tempo de Espera.
// Sai de "Aguardando" -> pausa hoje. Volta para "Aguardando" -> desconta os dias pausados e retoma.
export function ajusteDeEspera(
  anterior: Paciente | undefined,
  novoStatus: StatusPaciente,
  hoje = new Date()
): Pick<Paciente, "esperaPausadaEm" | "diasPausados"> {
  const estavaAguardando = !anterior || anterior.status === "Aguardando";
  const ficaAguardando = novoStatus === "Aguardando";
  if (estavaAguardando && !ficaAguardando)
    return { esperaPausadaEm: hojeFormatado(hoje) };
  if (!estavaAguardando && ficaAguardando)
    return {
      esperaPausadaEm: null,
      diasPausados:
        (anterior.diasPausados ?? 0) +
        (diasEntre(
          anterior.esperaPausadaEm ?? undefined,
          hojeFormatado(hoje)
        ) ?? 0),
    };
  return {};
}
