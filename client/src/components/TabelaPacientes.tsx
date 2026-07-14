import React, { useState, useMemo } from 'react';
import { Paciente, StatusPaciente } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Eye, Pen } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<StatusPaciente, string> = {
  'Aguardando': 'bg-blue-100 text-blue-800',
  'Em Atendimento': 'bg-yellow-100 text-yellow-800',
  'Desistência': 'bg-red-100 text-red-800',
  'Perdeu a Vaga': 'bg-red-100 text-red-800',
  'Alta': 'bg-green-100 text-green-800',
};

interface TabelaPacientesProps {
  pacientes: Paciente[];
  onDeletarPaciente: (id: string) => void;
  onAtualizarStatus: (id: string, novoStatus: StatusPaciente) => void;
  onExportarPDF: (pacientes: Paciente[]) => void;
  onEditarPaciente?: (paciente: Paciente) => void;
}

export function TabelaPacientes({
  pacientes,
  onDeletarPaciente,
  onAtualizarStatus,
  onExportarPDF,
  onEditarPaciente,
}: TabelaPacientesProps) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusPaciente | 'Todos'>('Todos');
  const [buscaPorCampo, setBuscaPorCampo] = useState<'nome' | 'cpf' | 'cns' | 'dataNascimento'>('nome');
  const [detalhePaciente, setDetalhePaciente] = useState<Paciente | null>(null);
  const [statusEditando, setStatusEditando] = useState<string | null>(null);

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((p) => {
      if (filtroStatus !== 'Todos' && p.status !== filtroStatus) {
        return false;
      }

      if (busca.trim()) {
        const buscaLower = busca.toLowerCase();
        switch (buscaPorCampo) {
          case 'cpf':
            return p.cpf.toLowerCase().includes(buscaLower);
          case 'cns':
            return p.cns.toLowerCase().includes(buscaLower);
          case 'dataNascimento':
            return p.dataNascimento.toLowerCase().includes(buscaLower);
          case 'nome':
          default:
            return p.nome.toLowerCase().includes(buscaLower);
        }
      }

      return true;
    });
  }, [pacientes, busca, filtroStatus, buscaPorCampo]);

  const handleDeletar = (id: string) => {
    onDeletarPaciente(id);
    toast.success('Paciente removido com sucesso!');
  };

  const handleAlterarStatus = (id: string, novoStatus: StatusPaciente) => {
    onAtualizarStatus(id, novoStatus);
    setStatusEditando(null);
  };

  const handleEditar = (paciente: Paciente) => {
    if (onEditarPaciente) {
      onEditarPaciente(paciente);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border border-border rounded-lg p-6 shadow-sm mt-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Fila de Pacientes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="busca" className="text-sm font-medium">
            Buscar
          </Label>
          <Input
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite para buscar..."
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="tipoBusca" className="text-sm font-medium">
            Tipo de Busca
          </Label>
          <Select value={buscaPorCampo} onValueChange={(value: any) => setBuscaPorCampo(value)}>
            <SelectTrigger id="tipoBusca" className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome">Nome</SelectItem>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cns">CNS</SelectItem>
              <SelectItem value="dataNascimento">Data de Nascimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="filtroStatus" className="text-sm font-medium">
            Filtrar por Status
          </Label>
          <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
            <SelectTrigger id="filtroStatus" className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Aguardando">Aguardando</SelectItem>
              <SelectItem value="Em Atendimento">Em Atendimento</SelectItem>
              <SelectItem value="Desistência">Desistência</SelectItem>
              <SelectItem value="Perdeu a Vaga">Perdeu a Vaga</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 justify-end">
          <Button
            onClick={() => onExportarPDF(pacientesFiltrados)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            Exportar para PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {pacientesFiltrados.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum paciente encontrado.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary border-border">
                <TableHead className="text-sm font-semibold text-center w-12">#</TableHead>
                <TableHead className="text-sm font-semibold">Nome</TableHead>
                <TableHead className="text-sm font-semibold">Telefone</TableHead>
                <TableHead className="text-sm font-semibold">Data</TableHead>
                <TableHead className="text-sm font-semibold">UBS</TableHead>
                <TableHead className="text-sm font-semibold">CPF</TableHead>
                <TableHead className="text-sm font-semibold">CNS</TableHead>
                <TableHead className="text-sm font-semibold">Status</TableHead>
                <TableHead className="text-sm font-semibold">Profissional</TableHead>
                <TableHead className="text-sm font-semibold">Diagnóstico</TableHead>
                <TableHead className="text-sm font-semibold text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pacientesFiltrados.map((paciente, index) => {
                const numeroOriginal = pacientes.findIndex((p) => p.id === paciente.id) + 1;
                return (
                  <TableRow
                    key={paciente.id}
                    className={`border-border hover:bg-secondary/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'
                    }`}
                  >
                    <TableCell className="text-sm font-medium text-center">{numeroOriginal}</TableCell>
                    <TableCell className="text-sm font-medium">{paciente.nome}</TableCell>
                    <TableCell className="text-sm">{paciente.telefone}</TableCell>
                    <TableCell className="text-sm">{paciente.data}</TableCell>
                    <TableCell className="text-sm">{paciente.ubs}</TableCell>
                    <TableCell className="text-sm">{paciente.cpf}</TableCell>
                    <TableCell className="text-sm">{paciente.cns}</TableCell>
                    <TableCell className="text-sm">
                      {statusEditando === paciente.id ? (
                        <Select
                          value={paciente.status}
                          onValueChange={(novoStatus) =>
                            handleAlterarStatus(paciente.id, novoStatus as StatusPaciente)
                          }
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aguardando">Aguardando</SelectItem>
                            <SelectItem value="Em Atendimento">Em Atendimento</SelectItem>
                            <SelectItem value="Desistência">Desistência</SelectItem>
                            <SelectItem value="Perdeu a Vaga">Perdeu a Vaga</SelectItem>
                            <SelectItem value="Alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          className={`${STATUS_COLORS[paciente.status]} text-xs font-medium cursor-pointer hover:opacity-80`}
                          onClick={() => setStatusEditando(paciente.id)}
                        >
                          {paciente.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {paciente.profissional ? (
                        <span className="text-xs">{paciente.profissional}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {paciente.diagnostico ? (
                        <span className="text-xs" title={paciente.diagnostico}>{paciente.diagnostico}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      <div className="flex gap-2 justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetalhePaciente(paciente)}
                              className="text-primary hover:text-primary/80"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalhes do Paciente</DialogTitle>
                            </DialogHeader>
                            {detalhePaciente && (
                              <div className="space-y-3 text-sm">
                                <div>
                                  <strong>Nome:</strong> {detalhePaciente.nome}
                                </div>
                                <div>
                                  <strong>Telefone:</strong> {detalhePaciente.telefone}
                                </div>
                                <div>
                                  <strong>Data:</strong> {detalhePaciente.data}
                                </div>
                                <div>
                                  <strong>Data de Nascimento:</strong> {detalhePaciente.dataNascimento}
                                </div>
                                <div>
                                  <strong>CPF:</strong> {detalhePaciente.cpf}
                                </div>
                                <div>
                                  <strong>CNS:</strong> {detalhePaciente.cns}
                                </div>
                                <div>
                                  <strong>UBS:</strong> {detalhePaciente.ubs}
                                </div>
                                <div>
                                  <strong>Status:</strong> <Badge className={`${STATUS_COLORS[detalhePaciente.status]} text-xs`}>{detalhePaciente.status}</Badge>
                                </div>
                                {detalhePaciente.profissional && (
                                  <div>
                                    <strong>Profissional:</strong> {detalhePaciente.profissional}
                                  </div>
                                )}
                                {detalhePaciente.diagnostico && (
                                  <div>
                                    <strong>Diagnóstico:</strong> {detalhePaciente.diagnostico}
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditar(paciente)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pen className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletar(paciente.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Exibindo {pacientesFiltrados.length} de {pacientes.length} pacientes
      </div>
    </div>
  );
}
