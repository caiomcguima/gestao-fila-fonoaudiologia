import { FormularioCadastro } from '@/components/FormularioCadastro';
import { TabelaPacientes } from '@/components/TabelaPacientes';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEdit } from '@/contexts/EditContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Paciente, StatusPaciente } from '@/types';
import { exportarParaPDF } from '@/lib/exportPDF';
import { toast } from 'sonner';

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Button
      onClick={logout}
      variant="ghost"
      className="text-primary-foreground hover:bg-primary/20"
      size="sm"
    >
      <LogOut className="w-4 h-4 mr-2" />
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
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-primary-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Conectando...
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        isConnected ? 'text-green-300' : 'text-yellow-300'
      }`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          Sincronizado
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Modo Local
        </>
      )}
    </div>
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

  const handleAdicionarPaciente = async (paciente: Omit<Paciente, 'id'>) => {
    try {
      await adicionarPaciente(paciente);
    } catch (error) {
      toast.error('Erro ao adicionar paciente');
      console.error(error);
    }
  };

  const handleAtualizarPaciente = async (
    id: string,
    paciente: Omit<Paciente, 'id'>
  ) => {
    try {
      await atualizarPaciente(id, paciente);
    } catch (error) {
      toast.error('Erro ao atualizar paciente');
      console.error(error);
    }
  };

  const handleAtualizarStatus = async (
    id: string,
    novoStatus: StatusPaciente
  ) => {
    const paciente = pacientes.find((p) => p.id === id);
    if (paciente) {
      await atualizarPaciente(id, { status: novoStatus });
    }
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    iniciarEdicao(paciente);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportarPDF = async (pacientesFiltrados: Paciente[]) => {
    if (pacientesFiltrados.length === 0) {
      toast.error('Nenhum paciente para exportar');
      return;
    }
    try {
      await exportarParaPDF(pacientesFiltrados);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                GESTÃO DE FILA - FONOAUDIOLOGIA
              </h1>
              <StatusSincronizacao
                isConnected={isConnected}
                isLoading={isLoading}
              />
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Formulário */}
        <FormularioCadastro
          onAdicionarPaciente={handleAdicionarPaciente}
          onAtualizarPaciente={handleAtualizarPaciente}
        />

        {/* Tabela */}
        <TabelaPacientes
          pacientes={pacientes}
          onDeletarPaciente={deletarPaciente}
          onAtualizarStatus={handleAtualizarStatus}
          onEditarPaciente={handleEditarPaciente}
          onExportarPDF={handleExportarPDF}
        />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-foreground mt-12 py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Sistema de Gestão de Fila de Fonoaudiologia - SUS</p>
          <p className="text-muted-foreground mt-1">
            Desenvolvido para otimizar o atendimento e a organização da fila
          </p>
        </div>
      </footer>
    </div>
  );
}
