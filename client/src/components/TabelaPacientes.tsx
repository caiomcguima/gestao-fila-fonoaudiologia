import { useMemo, useState } from "react";
import {
  Paciente,
  StatusPaciente,
  STATUS_FILA_ATIVA,
  STATUS_LIST,
} from "@/types";
import {
  contarPorStatus,
  numerarPorStatus,
  ordenarParaExibicao,
} from "@/lib/fila";
import type { LinhaPDF } from "@/lib/exportPDF";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Eye, Pen, FileDown, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Tons pastel com texto escuro (contraste AA). A cor nunca é a única pista: o nome do status vai junto.
const STATUS_COLORS: Record<StatusPaciente, string> = {
  Aguardando: "bg-[#E3EEF9] text-[#0B4F8A] ring-[#B9D3EE]",
  "Em Atendimento": "bg-[#FDF1DC] text-[#7A4A00] ring-[#F2D49B]",
  Desistência: "bg-[#FBE4E6] text-[#8C1D2B] ring-[#F1BBC2]",
  "Perdeu a Vaga": "bg-[#FCE8DA] text-[#8A3B0B] ring-[#F2C6A6]",
  Alta: "bg-[#DFF3E8] text-[#1D5E3A] ring-[#A9DABE]",
  Óbito: "bg-[#E7E9EE] text-[#3A4250] ring-[#C5CAD4]",
  "Mudou-se": "bg-[#EEE7F8] text-[#4F2F86] ring-[#D0C1EC]",
};
const corStatus = (status: string) =>
  STATUS_COLORS[status as StatusPaciente] ??
  "bg-muted text-foreground ring-border";

type Filtro = "Fila" | "Todos" | StatusPaciente;
type CampoBusca = "nome" | "cpf" | "cns" | "dataNascimento";

const TITULO_FILTRO: Record<"Fila" | "Todos", string> = {
  Fila: "Fila ativa",
  Todos: "Todos os status",
};

interface TabelaPacientesProps {
  pacientes: Paciente[];
  onDeletarPaciente: (id: string) => void;
  onAtualizarStatus: (id: string, novoStatus: StatusPaciente) => void;
  onExportarPDF: (linhas: LinhaPDF[], titulo: string) => void;
  onEditarPaciente?: (paciente: Paciente) => void;
}

export function TabelaPacientes({
  pacientes,
  onDeletarPaciente,
  onAtualizarStatus,
  onExportarPDF,
  onEditarPaciente,
}: TabelaPacientesProps) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Fila");
  const [buscaPorCampo, setBuscaPorCampo] = useState<CampoBusca>("nome");
  const [detalhePaciente, setDetalhePaciente] = useState<Paciente | null>(null);
  const [pacienteExcluir, setPacienteExcluir] = useState<Paciente | null>(null);

  // Nº calculado sobre a lista inteira, então a busca por texto não altera a posição de ninguém
  const numeros = useMemo(() => numerarPorStatus(pacientes), [pacientes]);
  const contagem = useMemo(() => contarPorStatus(pacientes), [pacientes]);

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = pacientes.filter(p => {
      if (filtro === "Fila" && !STATUS_FILA_ATIVA.includes(p.status))
        return false;
      if (filtro !== "Fila" && filtro !== "Todos" && p.status !== filtro)
        return false;
      return !termo || (p[buscaPorCampo] ?? "").toLowerCase().includes(termo);
    });
    return ordenarParaExibicao(lista);
  }, [pacientes, busca, filtro, buscaPorCampo]);

  const filtroUmStatus = filtro !== "Fila" && filtro !== "Todos";
  // Posição na fila só existe para "Aguardando"; filtrando um status, cada lista tem seu próprio Nº
  const numeroDe = (p: Paciente) =>
    filtroUmStatus || p.status === "Aguardando" ? numeros.get(p.id) : undefined;
  const rotuloNumero =
    filtroUmStatus && filtro !== "Aguardando" ? "Nº" : "Posição";
  const tituloAtual = filtroUmStatus ? filtro : TITULO_FILTRO[filtro];

  const opcoesFiltro: { valor: Filtro; rotulo: string; total: number }[] = [
    {
      valor: "Fila",
      rotulo: "Fila ativa",
      total: STATUS_FILA_ATIVA.reduce(
        (s, st) => s + (contagem.get(st) ?? 0),
        0
      ),
    },
    ...STATUS_LIST.map(s => ({
      valor: s as Filtro,
      rotulo: s,
      total: contagem.get(s) ?? 0,
    })),
    { valor: "Todos", rotulo: "Todos", total: pacientes.length },
  ];

  const confirmarExclusao = () => {
    if (!pacienteExcluir) return;
    onDeletarPaciente(pacienteExcluir.id);
    toast.success("Paciente excluído");
    setPacienteExcluir(null);
  };

  const exportar = () =>
    onExportarPDF(
      pacientesFiltrados.map(p => ({ paciente: p, numero: numeroDe(p) })),
      tituloAtual
    );

  const acoes = {
    onVer: setDetalhePaciente,
    onEditar: (p: Paciente) => onEditarPaciente?.(p),
    onExcluir: setPacienteExcluir,
  };

  return (
    <section aria-labelledby="titulo-fila" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h2 id="titulo-fila" className="text-foreground">
            {tituloAtual}
          </h2>
          <p className="text-muted-foreground mt-1">
            {filtro === "Fila"
              ? "Aguardando em ordem de entrada, seguidos de quem está em atendimento."
              : "Numeração por ordem de entrada (campo Data)."}
          </p>
        </div>
        <Button onClick={exportar} className="rounded-full h-11 px-5 gap-2">
          <FileDown className="size-4" aria-hidden />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros por status com contagem: mostram quantos pacientes há em cada um */}
      <div
        role="group"
        aria-label="Filtrar por status"
        className="-mx-4 px-4 overflow-x-auto pb-2"
      >
        <div className="flex gap-2 w-max">
          {opcoesFiltro.map(o => {
            const ativo = filtro === o.valor;
            return (
              <button
                key={o.valor}
                type="button"
                aria-pressed={ativo}
                onClick={() => setFiltro(o.valor)}
                className={cn(
                  "flex items-center gap-2 rounded-full h-10 pl-4 pr-1.5 text-[0.95rem] border transition-colors",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  ativo
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/50"
                )}
              >
                {o.rotulo}
                <span
                  className={cn(
                    "min-w-7 h-7 px-2 rounded-full grid place-items-center text-sm font-bold",
                    ativo ? "bg-white/20" : "bg-secondary"
                  )}
                >
                  {o.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-3 mt-4 mb-6">
        <div>
          <Label htmlFor="tipoBusca" className="sr-only">
            Buscar por
          </Label>
          <Select
            value={buscaPorCampo}
            onValueChange={v => setBuscaPorCampo(v as CampoBusca)}
          >
            <SelectTrigger
              id="tipoBusca"
              className="h-11 w-full bg-card rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome">Buscar por nome</SelectItem>
              <SelectItem value="cpf">Buscar por CPF</SelectItem>
              <SelectItem value="cns">Buscar por CNS</SelectItem>
              <SelectItem value="dataNascimento">
                Buscar por nascimento
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Label htmlFor="busca" className="sr-only">
            Termo de busca
          </Label>
          <Search
            className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="busca"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Digite para buscar"
            className="h-11 pl-10 bg-card rounded-xl"
          />
        </div>
      </div>

      {pacientesFiltrados.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card py-14 text-center text-muted-foreground">
          Nenhum paciente com este filtro. Troque o status acima ou limpe a
          busca.
        </div>
      ) : (
        <>
          {/* Celular: cartões */}
          <ul className="md:hidden space-y-3">
            {pacientesFiltrados.map(p => (
              <CartaoPaciente
                key={p.id}
                paciente={p}
                numero={numeroDe(p)}
                onStatus={onAtualizarStatus}
                {...acoes}
              />
            ))}
          </ul>

          {/* Computador: tabela */}
          <div className="hidden md:block rounded-3xl border border-border bg-card overflow-x-auto shadow-[0_1px_2px_rgba(18,48,77,0.04),0_8px_24px_-12px_rgba(18,48,77,0.12)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                  <TableHead className="w-20 text-center">
                    {rotuloNumero}
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>UBS</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>CNS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientesFiltrados.map(p => (
                  <TableRow key={p.id} className="text-[0.95rem]">
                    <TableCell className="text-center">
                      <Numero
                        numero={numeroDe(p)}
                        destaque={p.status === "Aguardando"}
                      />
                    </TableCell>
                    <TableCell className="font-bold">{p.nome}</TableCell>
                    <TableCell>{p.telefone}</TableCell>
                    <TableCell>{p.data}</TableCell>
                    <TableCell>{p.ubs}</TableCell>
                    <TableCell>{p.cpf}</TableCell>
                    <TableCell>{p.cns}</TableCell>
                    <TableCell>
                      <StatusEditavel
                        paciente={p}
                        onStatus={onAtualizarStatus}
                      />
                    </TableCell>
                    <TableCell>{p.profissional || <Vazio />}</TableCell>
                    <TableCell
                      className="max-w-[14rem] truncate"
                      title={p.diagnostico}
                    >
                      {p.diagnostico || <Vazio />}
                    </TableCell>
                    <TableCell>
                      <Acoes paciente={p} {...acoes} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <p className="mt-4 text-muted-foreground">
        Exibindo {pacientesFiltrados.length} de {pacientes.length} pacientes
      </p>

      <Dialog
        open={!!detalhePaciente}
        onOpenChange={aberto => !aberto && setDetalhePaciente(null)}
      >
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {detalhePaciente?.nome || "Detalhes do paciente"}
            </DialogTitle>
          </DialogHeader>
          {detalhePaciente && <Detalhes paciente={detalhePaciente} />}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pacienteExcluir}
        onOpenChange={aberto => !aberto && setPacienteExcluir(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {pacienteExcluir?.nome}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O cadastro será apagado do banco e não poderá ser recuperado. Para
              tirar alguém da fila sem apagar, altere o status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir paciente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function Vazio() {
  return (
    <span className="text-muted-foreground" aria-label="não informado">
      -
    </span>
  );
}

function Numero({ numero, destaque }: { numero?: number; destaque: boolean }) {
  if (!numero) return <Vazio />;
  return (
    <span
      className={cn(
        "inline-grid place-items-center min-w-10 h-10 px-2 rounded-full font-bold",
        destaque
          ? "bg-primary text-primary-foreground text-lg"
          : "bg-secondary text-foreground"
      )}
    >
      {numero}
    </span>
  );
}

function StatusEditavel({
  paciente,
  onStatus,
}: {
  paciente: Paciente;
  onStatus: (id: string, status: StatusPaciente) => void;
}) {
  return (
    <Select
      value={paciente.status}
      onValueChange={s => onStatus(paciente.id, s as StatusPaciente)}
    >
      <SelectTrigger
        aria-label={`Alterar status de ${paciente.nome}`}
        className={cn(
          "h-8 w-auto gap-1.5 rounded-full border-0 px-3 text-sm font-bold ring-1 shadow-none",
          corStatus(paciente.status)
        )}
      >
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
  );
}

interface AcoesProps {
  paciente: Paciente;
  onVer: (p: Paciente) => void;
  onEditar: (p: Paciente) => void;
  onExcluir: (p: Paciente) => void;
}

function Acoes({ paciente, onVer, onEditar, onExcluir }: AcoesProps) {
  return (
    <div className="flex gap-1 justify-center">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Ver detalhes de ${paciente.nome}`}
        onClick={() => onVer(paciente)}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Editar ${paciente.nome}`}
        onClick={() => onEditar(paciente)}
      >
        <Pen className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Excluir ${paciente.nome}`}
        onClick={() => onExcluir(paciente)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function CartaoPaciente({
  paciente,
  numero,
  onStatus,
  ...acoes
}: AcoesProps & {
  numero?: number;
  onStatus: (id: string, status: StatusPaciente) => void;
}) {
  return (
    <li className="rounded-3xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Numero numero={numero} destaque={paciente.status === "Aguardando"} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-lg leading-snug">{paciente.nome}</p>
          <p className="text-muted-foreground">
            {paciente.telefone || "Sem telefone"}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[0.95rem]">
        <Campo rotulo="Data" valor={paciente.data} />
        <Campo rotulo="UBS" valor={paciente.ubs} />
        <Campo rotulo="CPF" valor={paciente.cpf} />
        <Campo rotulo="CNS" valor={paciente.cns} />
        {paciente.profissional && (
          <Campo rotulo="Profissional" valor={paciente.profissional} largo />
        )}
        {paciente.diagnostico && (
          <Campo rotulo="Diagnóstico" valor={paciente.diagnostico} largo />
        )}
      </dl>
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border">
        <StatusEditavel paciente={paciente} onStatus={onStatus} />
        <Acoes paciente={paciente} {...acoes} />
      </div>
    </li>
  );
}

function Campo({
  rotulo,
  valor,
  largo,
}: {
  rotulo: string;
  valor?: string;
  largo?: boolean;
}) {
  return (
    <div className={cn("min-w-0", largo && "col-span-2")}>
      <dt className="text-sm text-muted-foreground">{rotulo}</dt>
      <dd className="break-words">{valor || "-"}</dd>
    </div>
  );
}

function Detalhes({ paciente }: { paciente: Paciente }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Campo rotulo="Telefone" valor={paciente.telefone} />
      <Campo rotulo="Data" valor={paciente.data} />
      <Campo rotulo="Nascimento" valor={paciente.dataNascimento} />
      <Campo rotulo="UBS" valor={paciente.ubs} />
      <Campo rotulo="CPF" valor={paciente.cpf} />
      <Campo rotulo="CNS" valor={paciente.cns} />
      <div className="col-span-2">
        <dt className="text-sm text-muted-foreground">Status</dt>
        <dd>
          <span
            className={cn(
              "inline-block mt-1 rounded-full px-3 py-1 text-sm font-bold ring-1",
              corStatus(paciente.status)
            )}
          >
            {paciente.status}
          </span>
        </dd>
      </div>
      {paciente.profissional && (
        <Campo rotulo="Profissional" valor={paciente.profissional} largo />
      )}
      {paciente.diagnostico && (
        <Campo rotulo="Diagnóstico" valor={paciente.diagnostico} largo />
      )}
    </dl>
  );
}
