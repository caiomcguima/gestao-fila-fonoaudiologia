import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Paciente, StatusPaciente } from '@/types';
import { maskCPF, maskCNS, maskData, maskTelefone } from '@/lib/masks';
import { useEdit } from '@/contexts/EditContext';
import { toast } from 'sonner';

const PROFISSIONAIS = [
  'Tarciana Aparecida Rodrigues do Vale',
  'Tassia Silveira Torresia Machado',
];

interface FormularioCadastroProps {
  onAdicionarPaciente: (paciente: Omit<Paciente, 'id'>) => void;
  onAtualizarPaciente?: (id: string, paciente: Omit<Paciente, 'id'>) => void;
}

export function FormularioCadastro({ onAdicionarPaciente, onAtualizarPaciente }: FormularioCadastroProps) {
  const { pacienteEmEdicao, finalizarEdicao } = useEdit();
  
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [cns, setCns] = useState('');
  const [ubs, setUbs] = useState('');
  const [status, setStatus] = useState<StatusPaciente>('Aguardando');
  const [profissional, setProfissional] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [openProfissional, setOpenProfissional] = useState(false);
  const [openDiagnostico, setOpenDiagnostico] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    if (pacienteEmEdicao) {
      setNome(pacienteEmEdicao.nome);
      setTelefone(pacienteEmEdicao.telefone);
      setData(pacienteEmEdicao.data);
      setDataNascimento(pacienteEmEdicao.dataNascimento);
      setCpf(pacienteEmEdicao.cpf);
      setCns(pacienteEmEdicao.cns);
      setUbs(pacienteEmEdicao.ubs);
      setStatus(pacienteEmEdicao.status);
      setProfissional(pacienteEmEdicao.profissional || '');
      setDiagnostico(pacienteEmEdicao.diagnostico || '');
      setModoEdicao(true);
    }
  }, [pacienteEmEdicao]);

  const validarFormulario = (): boolean => {
    if (diagnostico.length > 180) {
      toast.error('Diagnóstico não pode exceder 180 caracteres');
      return false;
    }
    return true;
  };

  const limparFormulario = () => {
    setNome('');
    setTelefone('');
    setData('');
    setDataNascimento('');
    setCpf('');
    setCns('');
    setUbs('');
    setStatus('Aguardando');
    setProfissional('');
    setDiagnostico('');
    setModoEdicao(false);
    finalizarEdicao();
  };

  const handleGravar = () => {
    if (!validarFormulario()) return;

    const novoPaciente: Omit<Paciente, 'id'> = {
      nome,
      telefone,
      data,
      dataNascimento,
      cpf,
      cns,
      ubs,
      status,
      profissional: status === 'Em Atendimento' ? profissional : undefined,
      diagnostico: diagnostico || undefined,
    };

    if (modoEdicao && pacienteEmEdicao && onAtualizarPaciente) {
      onAtualizarPaciente(pacienteEmEdicao.id, novoPaciente);
      toast.success('Paciente atualizado com sucesso!');
    } else {
      onAdicionarPaciente(novoPaciente);
      toast.success('Paciente adicionado com sucesso!');
    }

    limparFormulario();
  };

  const handleCancelar = () => {
    limparFormulario();
  };

  return (
    <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {modoEdicao ? 'Editar Paciente' : 'Adicionar Paciente'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Nome */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome" className="text-sm font-medium">
            Nome
          </Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do paciente"
            className="text-sm"
          />
        </div>

        {/* Telefone */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="telefone" className="text-sm font-medium">
            Telefone
          </Label>
          <Input
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(maskTelefone(e.target.value))}
            placeholder="(XX) XXXXX-XXXX"
            className="text-sm"
            maxLength={15}
          />
        </div>

        {/* Data */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="data" className="text-sm font-medium">
            Data
          </Label>
          <Input
            id="data"
            value={data}
            onChange={(e) => setData(maskData(e.target.value))}
            placeholder="DD/MM/YYYY"
            className="text-sm"
            maxLength={10}
          />
        </div>

        {/* Data de Nascimento */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dataNascimento" className="text-sm font-medium">
            Data de Nascimento
          </Label>
          <Input
            id="dataNascimento"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(maskData(e.target.value))}
            placeholder="DD/MM/YYYY"
            className="text-sm"
            maxLength={10}
          />
        </div>

        {/* CPF */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="cpf" className="text-sm font-medium">
            CPF
          </Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(maskCPF(e.target.value))}
            placeholder="XXX.XXX.XXX-XX"
            className="text-sm"
            maxLength={14}
          />
        </div>

        {/* CNS */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="cns" className="text-sm font-medium">
            CNS
          </Label>
          <Input
            id="cns"
            value={cns}
            onChange={(e) => setCns(maskCNS(e.target.value))}
            placeholder="XXXX XXXX XXXX XXXX"
            className="text-sm"
            maxLength={19}
          />
        </div>

        {/* UBS */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="ubs" className="text-sm font-medium">
            UBS
          </Label>
          <Input
            id="ubs"
            value={ubs}
            onChange={(e) => setUbs(e.target.value)}
            placeholder="Unidade de Saúde"
            className="text-sm"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <Select value={status} onValueChange={(value) => setStatus(value as StatusPaciente)}>
            <SelectTrigger id="status" className="text-sm">
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
        </div>
      </div>

      {/* Linha 2: Diagnóstico e Botões */}
      <div className="flex gap-4 items-end flex-wrap">
        {/* Diagnóstico */}
        <Dialog open={openDiagnostico} onOpenChange={setOpenDiagnostico}>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-sm">
              Adicionar Diagnóstico (Opcional)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Diagnóstico</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="diagnostico-input" className="text-sm font-medium mb-2 block">
                  Diagnóstico ({diagnostico.length}/180 caracteres)
                </Label>
                <Textarea
                  id="diagnostico-input"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value.slice(0, 180))}
                  placeholder="Digite o diagnóstico do paciente..."
                  className="text-sm"
                  rows={4}
                />
              </div>
              <Button
                onClick={() => setOpenDiagnostico(false)}
                className="w-full"
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profissional (se Em Atendimento) */}
        {status === 'Em Atendimento' && (
          <Dialog open={openProfissional} onOpenChange={setOpenProfissional}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-sm">
                Selecionar Fonoaudióloga
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Selecionar Fonoaudióloga</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {PROFISSIONAIS.map((prof) => (
                  <Button
                    key={prof}
                    variant={profissional === prof ? 'default' : 'outline'}
                    onClick={() => {
                      setProfissional(prof);
                      setOpenProfissional(false);
                    }}
                    className="text-left justify-start"
                  >
                    {prof}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Botão Gravar */}
        <Button
          onClick={handleGravar}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          {modoEdicao ? 'Atualizar' : 'Gravar'}
        </Button>

        {/* Botão Cancelar (se em edição) */}
        {modoEdicao && (
          <Button
            onClick={handleCancelar}
            variant="outline"
            className="text-sm font-medium"
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
