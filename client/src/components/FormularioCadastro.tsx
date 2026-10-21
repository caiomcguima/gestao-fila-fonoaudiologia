import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Paciente, PROFISSIONAIS, StatusPaciente, STATUS_LIST } from "@/types";
import { maskCPF, maskCNS, maskData, maskTelefone } from "@/lib/masks";
import { useEdit } from "@/contexts/EditContext";
import { toast } from "sonner";

interface FormularioCadastroProps {
  onAdicionarPaciente: (paciente: Omit<Paciente, "id">) => void;
  onAtualizarPaciente?: (id: string, paciente: Omit<Paciente, "id">) => void;
}

export function FormularioCadastro({
  onAdicionarPaciente,
  onAtualizarPaciente,
}: FormularioCadastroProps) {
  const { pacienteEmEdicao, finalizarEdicao } = useEdit();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [cns, setCns] = useState("");
  const [ubs, setUbs] = useState("");
  const [status, setStatus] = useState<StatusPaciente>("Aguardando");
  const [profissional, setProfissional] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
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
      setProfissional(pacienteEmEdicao.profissional || "");
      setDiagnostico(pacienteEmEdicao.diagnostico || "");
      setModoEdicao(true);
    }
  }, [pacienteEmEdicao]);

  const validarFormulario = (): boolean => {
    if (diagnostico.length > 180) {
      toast.error("Diagnóstico não pode exceder 180 caracteres");
      return false;
    }
    return true;
  };

  const limparFormulario = () => {
    setNome("");
    setTelefone("");
    setData("");
    setDataNascimento("");
    setCpf("");
    setCns("");
    setUbs("");
    setStatus("Aguardando");
    setProfissional("");
    setDiagnostico("");
    setModoEdicao(false);
    finalizarEdicao();
  };

  const handleGravar = () => {
    if (!validarFormulario()) return;

    const novoPaciente: Omit<Paciente, "id"> = {
      nome,
      telefone,
      data,
      dataNascimento,
      cpf,
      cns,
      ubs,
      status,
      // Mantém quem atendeu mesmo após Alta/Desistência etc.; só quem ainda aguarda fica sem profissional
      profissional:
        status !== "Aguardando" ? profissional || undefined : undefined,
      diagnostico: diagnostico || undefined,
    };

    if (modoEdicao && pacienteEmEdicao && onAtualizarPaciente) {
      onAtualizarPaciente(pacienteEmEdicao.id, novoPaciente);
      toast.success("Paciente atualizado com sucesso!");
    } else {
      onAdicionarPaciente(novoPaciente);
      toast.success("Paciente adicionado com sucesso!");
    }

    limparFormulario();
  };

  const handleCancelar = () => {
    limparFormulario();
  };

  return (
    <section
      aria-labelledby="titulo-formulario"
      className={`rounded-3xl border bg-card p-5 sm:p-7 shadow-[0_1px_2px_rgba(18,48,77,0.04),0_8px_24px_-12px_rgba(18,48,77,0.12)] ${
        modoEdicao ? "border-primary ring-4 ring-primary/10" : "border-border"
      }`}
    >
      <h2 id="titulo-formulario" className="text-foreground mb-1">
        {modoEdicao
          ? `Editando ${pacienteEmEdicao?.nome || "paciente"}`
          : "Adicionar paciente"}
      </h2>
      <p className="text-muted-foreground mb-6">
        {modoEdicao
          ? "Altere os campos e salve."
          : "Preencha os dados para colocar o paciente na fila."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Nome */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome" className="font-bold">
            Nome
          </Label>
          <Input
            id="nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome do paciente"
            className="h-11 rounded-xl"
          />
        </div>

        {/* Telefone */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="telefone" className="font-bold">
            Telefone
          </Label>
          <Input
            id="telefone"
            value={telefone}
            onChange={e => setTelefone(maskTelefone(e.target.value))}
            placeholder="(XX) XXXXX-XXXX"
            className="h-11 rounded-xl"
            maxLength={15}
          />
        </div>

        {/* Data */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="data" className="font-bold">
            Data
          </Label>
          <Input
            id="data"
            value={data}
            onChange={e => setData(maskData(e.target.value))}
            placeholder="DD/MM/YYYY"
            className="h-11 rounded-xl"
            maxLength={10}
          />
        </div>

        {/* Data de Nascimento */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dataNascimento" className="font-bold">
            Data de Nascimento
          </Label>
          <Input
            id="dataNascimento"
            value={dataNascimento}
            onChange={e => setDataNascimento(maskData(e.target.value))}
            placeholder="DD/MM/YYYY"
            className="h-11 rounded-xl"
            maxLength={10}
          />
        </div>

        {/* CPF */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="cpf" className="font-bold">
            CPF
          </Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={e => setCpf(maskCPF(e.target.value))}
            placeholder="XXX.XXX.XXX-XX"
            className="h-11 rounded-xl"
            maxLength={14}
          />
        </div>

        {/* CNS */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="cns" className="font-bold">
            CNS
          </Label>
          <Input
            id="cns"
            value={cns}
            onChange={e => setCns(maskCNS(e.target.value))}
            placeholder="XXXX XXXX XXXX XXXX"
            className="h-11 rounded-xl"
            maxLength={19}
          />
        </div>

        {/* UBS */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="ubs" className="font-bold">
            UBS
          </Label>
          <Input
            id="ubs"
            value={ubs}
            onChange={e => setUbs(e.target.value)}
            placeholder="Unidade de Saúde"
            className="h-11 rounded-xl"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="status" className="font-bold">
            Status
          </Label>
          <Select
            value={status}
            onValueChange={value => setStatus(value as StatusPaciente)}
          >
            <SelectTrigger id="status" className="h-11 w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_LIST.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Linha 2: Diagnóstico e Botões */}
      <div className="flex gap-3 items-center flex-wrap pt-2">
        {/* Diagnóstico */}
        <Dialog open={openDiagnostico} onOpenChange={setOpenDiagnostico}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 rounded-full px-5">
              {diagnostico
                ? "Editar diagnóstico"
                : "Adicionar diagnóstico (opcional)"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Diagnóstico</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <Label
                  htmlFor="diagnostico-input"
                  className="text-sm font-medium mb-2 block"
                >
                  Diagnóstico ({diagnostico.length}/180 caracteres)
                </Label>
                <Textarea
                  id="diagnostico-input"
                  value={diagnostico}
                  onChange={e => setDiagnostico(e.target.value.slice(0, 180))}
                  placeholder="Digite o diagnóstico do paciente..."
                  className="h-11 rounded-xl"
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

        {/* Profissional (qualquer status fora da espera) */}
        {status !== "Aguardando" && (
          <Dialog open={openProfissional} onOpenChange={setOpenProfissional}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 rounded-full px-5">
                {profissional
                  ? profissional.split(" ")[0]
                  : "Selecionar fonoaudióloga"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Selecionar Fonoaudióloga</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {PROFISSIONAIS.map(prof => (
                  <Button
                    key={prof}
                    variant={profissional === prof ? "default" : "outline"}
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
          className="h-11 rounded-full px-7 font-bold sm:ml-auto"
        >
          {modoEdicao ? "Salvar alterações" : "Adicionar à fila"}
        </Button>

        {/* Botão Cancelar (se em edição) */}
        {modoEdicao && (
          <Button
            onClick={handleCancelar}
            variant="outline"
            className="font-bold"
          >
            Cancelar
          </Button>
        )}
      </div>
    </section>
  );
}
