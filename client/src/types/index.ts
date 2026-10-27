// Fonte única dos nomes de status. A ordem aqui é a ordem de exibição.
export const STATUS_LIST = [
  "Em Atendimento",
  "Aguardando",
  "Desistência",
  "Perdeu a Vaga",
  "Alta",
  "Óbito",
  "Mudou-se",
] as const;

export type StatusPaciente = (typeof STATUS_LIST)[number];

export const PROFISSIONAIS = [
  "Tarciana Aparecida Rodrigues do Vale",
  "Tassia Silveira Torresia Machado",
];

export interface Paciente {
  id: string;
  nome: string; // Nome do paciente
  telefone: string; // Telefone (XX X XXXX-XXXX)
  data: string; // Data de Admissão na fila (DD/MM/YYYY)
  dataNascimento: string; // DN (DD/MM/YYYY)
  cpf: string; // XXX.XXX.XXX-XX
  cns: string; // 15 dígitos
  ubs: string; // Unidade de Saúde de Referência
  status: StatusPaciente;
  profissional?: string; // Nome da fonoaudióloga (quando status = "Em Atendimento")
  dataAlta?: string; // Data da alta (DD/MM/YYYY), só quando status = "Alta"
  esperaPausadaEm?: string | null; // DD/MM/YYYY em que saiu de "Aguardando"; null = contando
  diasPausados?: number; // Dias fora de "Aguardando" já descontados (quando voltou à fila)
  diagnostico?: string; // Exibido como "Observações". Máximo 180 caracteres
  created_at?: string; // Preenchido pelo banco
}

export interface FiltrosBusca {
  nome?: string;
  dataNascimento?: string;
  cpf?: string;
  cns?: string;
  status?: StatusPaciente;
}
