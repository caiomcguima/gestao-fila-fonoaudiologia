import { Paciente, STATUS_LIST } from "@/types";

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

// Dias entre a Data de Admissão (DD/MM/AAAA) e "hoje"; undefined se a data for inválida ou futura
export function diasDeEspera(data: string, hoje = new Date()): number | undefined {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data.trim());
  if (!m) return undefined;
  const admissao = Date.UTC(+m[3], +m[2] - 1, +m[1]);
  const agora = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dias = Math.round((agora - admissao) / 86_400_000);
  return dias >= 0 ? dias : undefined;
}

export function formatarEspera(data: string, hoje = new Date()): string {
  const dias = diasDeEspera(data, hoje);
  if (dias === undefined) return "-";
  return dias === 1 ? "1 dia" : `${dias} dias`;
}

// "Hoje" no formato DD/MM/AAAA (padrão da data da alta)
export function hojeFormatado(hoje = new Date()): string {
  return hoje.toLocaleDateString("pt-BR");
}
