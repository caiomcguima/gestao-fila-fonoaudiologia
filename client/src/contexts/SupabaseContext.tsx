import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Paciente } from "@/types";
import { createSupabaseClient } from "@/lib/supabase";

const STORAGE_KEY = "gestao_fila_pacientes";

interface SupabaseContextType {
  pacientes: Paciente[];
  adicionarPaciente: (paciente: Omit<Paciente, "id">) => Promise<void>;
  atualizarPaciente: (
    id: string,
    dados: Partial<Paciente>
  ) => Promise<void>;
  deletarPaciente: (id: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState<SupabaseClient | null>(() =>
    createSupabaseClient()
  );

  // Carregamento inicial + assinatura de tempo real
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      // Sem Supabase configurado: opera apenas com localStorage (Modo Local)
      if (!supabase) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setPacientes(JSON.parse(stored));
          } catch (error) {
            console.error(
              "Erro ao carregar pacientes do localStorage:",
              error
            );
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Erro ao carregar pacientes:", error);
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setPacientes(JSON.parse(stored));
          setIsLoading(false);
          return;
        }

        setPacientes((data as Paciente[]) || []);
        setIsConnected(true);

        // Sincronização em tempo real entre dispositivos
        const channel = supabase
          .channel("pacientes_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "pacientes" },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setPacientes((prev) => [...prev, payload.new as Paciente]);
              } else if (payload.eventType === "UPDATE") {
                setPacientes((prev) =>
                  prev.map((p) =>
                    p.id === (payload.new as Paciente).id
                      ? (payload.new as Paciente)
                      : p
                  )
                );
              } else if (payload.eventType === "DELETE") {
                setPacientes((prev) =>
                  prev.filter((p) => p.id !== (payload.old as Paciente).id)
                );
              }
            }
          )
          .subscribe();

        setIsLoading(false);
        cleanup = () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Erro ao inicializar Supabase:", error);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setPacientes(JSON.parse(stored));
        setIsLoading(false);
      }
    })();

    return () => cleanup?.();
  }, [supabase]);

  // Backup local: espelha o estado atual no localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pacientes));
    }
  }, [pacientes, isLoading]);

  const adicionarPaciente = async (paciente: Omit<Paciente, "id">) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("pacientes")
          .insert([{ ...paciente, created_at: new Date().toISOString() }]);
        if (error) throw error;
        // O estado é atualizado pela assinatura de tempo real (INSERT)
      } catch (error) {
        console.error("Erro ao adicionar paciente no Supabase:", error);
        const novo: Paciente = {
          ...paciente,
          id: `${Date.now()}-${Math.random()}`,
        };
        setPacientes((prev) => [...prev, novo]);
      }
    } else {
      const novo: Paciente = {
        ...paciente,
        id: `${Date.now()}-${Math.random()}`,
      };
      setPacientes((prev) => [...prev, novo]);
    }
  };

  const atualizarPaciente = async (id: string, dados: Partial<Paciente>) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("pacientes")
          .update({ ...dados, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        // O estado é atualizado pela assinatura de tempo real (UPDATE)
      } catch (error) {
        console.error("Erro ao atualizar paciente no Supabase:", error);
        setPacientes((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...dados } : p))
        );
      }
    } else {
      setPacientes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...dados } : p))
      );
    }
  };

  const deletarPaciente = async (id: string) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("pacientes")
          .delete()
          .eq("id", id);
        if (error) throw error;
        // O estado é atualizado pela assinatura de tempo real (DELETE)
      } catch (error) {
        console.error("Erro ao deletar paciente no Supabase:", error);
        setPacientes((prev) => prev.filter((p) => p.id !== id));
      }
    } else {
      setPacientes((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <SupabaseContext.Provider
      value={{
        pacientes,
        adicionarPaciente,
        atualizarPaciente,
        deletarPaciente,
        isConnected,
        isLoading,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase deve ser usado dentro de SupabaseProvider");
  }
  return context;
}
