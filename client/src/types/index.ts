export type StatusPaciente = 'Aguardando' | 'Em Atendimento' | 'Desistência' | 'Perdeu a Vaga' | 'Alta';

export interface Paciente {
  id: string;
  nome: string; // Nome do paciente
  telefone: string; // Telefone (XX X XXXX-XXXX)
  data: string; // Data de inserção (DD/MM/YYYY)
  dataNascimento: string; // DN (DD/MM/YYYY)
  cpf: string; // XXX.XXX.XXX-XX
  cns: string; // 15 dígitos
  ubs: string; // Unidade de Saúde de Referência
  status: StatusPaciente;
  profissional?: string; // Nome da fonoaudióloga (quando status = "Em Atendimento")
  diagnostico?: string; // Máximo 180 caracteres
}

export interface FiltrosBusca {
  nome?: string;
  dataNascimento?: string;
  cpf?: string;
  cns?: string;
  status?: StatusPaciente;
}
