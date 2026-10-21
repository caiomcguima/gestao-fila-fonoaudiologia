import { FormularioCadastro } from "@/components/FormularioCadastro";
import { TabelaPacientes } from "@/components/TabelaPacientes";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEdit } from "@/contexts/EditContext";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Paciente, StatusPaciente } from "@/types";
import { exportarParaPDF, type LinhaPDF } from "@/lib/exportPDF";
import { toast } from "sonner";

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Button
      onClick={logout}
      variant="ghost"
      className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground rounded-full"
      size="sm"
    >
      <LogOut className="w-4 h-4 mr-2" aria-hidden />
      Sair
    </Button>
  );
}

function StatusSincronizacao({
  isConnected,
  isLoading,
}: {
  isConnected: boolean;
  isLoading: boolean;
}) {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm";
  if (isLoading) {
    return (
      <span className={`${base} bg-white/15 text-primary-foreground`}>
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        Conectando
      </span>
    );
  }

  return isConnected ? (
    <span className={`${base} bg-white/15 text-primary-foreground`}>
      <Wifi className="w-4 h-4" aria-hidden />
      Sincronizado
    </span>
  ) : (
    <span className={`${base} bg-[#FDF1DC] text-[#7A4A00]`}>
      <WifiOff className="w-4 h-4" aria-hidden />
      Modo local: alterações ficam só neste navegador
    </span>
  );
}

export default function Home() {
  const {
    pacientes,
    adicionarPaciente,
    deletarPaciente,
    atualizarPaciente,
    isConnected,
    isLoading,
  } = useSupabase();
  const { iniciarEdicao } = useEdit();

  const handleAdicionarPaciente = async (paciente: Omit<Paciente, "id">) => {
    try {
      await adicionarPaciente(paciente);
    } catch (error) {
      toast.error("Erro ao adicionar paciente");
      console.error(error);
    }
  };

  const handleAtualizarPaciente = async (
    id: string,
    paciente: Omit<Paciente, "id">
  ) => {
    try {
      await atualizarPaciente(id, paciente);
    } catch (error) {
      toast.error("Erro ao atualizar paciente");
      console.error(error);
    }
  };

  const handleAtualizarStatus = async (
    id: string,
    novoStatus: StatusPaciente
  ) => {
    const paciente = pacientes.find(p => p.id === id);
    if (paciente) {
      await atualizarPaciente(id, { status: novoStatus });
    }
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    iniciarEdicao(paciente);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExportarPDF = async (linhas: LinhaPDF[], titulo: string) => {
    if (linhas.length === 0) {
      toast.error("Nenhum paciente para exportar");
      return;
    }
    try {
      await exportarParaPDF(linhas, titulo);
      toast.success("PDF exportado");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground rounded-b-[2rem] shadow-[0_10px_30px_-18px_rgba(0,61,122,0.8)]">
        <div className="container mx-auto py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-2xl sm:text-[1.75rem]">
              Fila de Fonoaudiologia
            </h1>
            <StatusSincronizacao
              isConnected={isConnected}
              isLoading={isLoading}
            />
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8">
        <FormularioCadastro
          onAdicionarPaciente={handleAdicionarPaciente}
          onAtualizarPaciente={handleAtualizarPaciente}
        />

        <TabelaPacientes
          pacientes={pacientes}
          onDeletarPaciente={deletarPaciente}
          onAtualizarStatus={handleAtualizarStatus}
          onEditarPaciente={handleEditarPaciente}
          onExportarPDF={handleExportarPDF}
        />
      </main>

      <footer className="mt-12 py-6 border-t border-border">
        <p className="container mx-auto text-center text-sm text-muted-foreground">
          Gestão da fila de fonoaudiologia do SUS
        </p>
      </footer>
    </div>
  );
}
