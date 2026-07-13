import React, { createContext, useContext, useState } from 'react';
import { Paciente } from '@/types';

interface EditContextType {
  pacienteEmEdicao: Paciente | null;
  iniciarEdicao: (paciente: Paciente) => void;
  finalizarEdicao: () => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export function EditProvider({ children }: { children: React.ReactNode }) {
  const [pacienteEmEdicao, setPacienteEmEdicao] = useState<Paciente | null>(null);

  const iniciarEdicao = (paciente: Paciente) => {
    setPacienteEmEdicao(paciente);
  };

  const finalizarEdicao = () => {
    setPacienteEmEdicao(null);
  };

  return (
    <EditContext.Provider value={{ pacienteEmEdicao, iniciarEdicao, finalizarEdicao }}>
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error('useEdit deve ser usado dentro de EditProvider');
  }
  return context;
}
