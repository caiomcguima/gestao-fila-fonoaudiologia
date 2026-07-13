import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CORRECT_PASSWORD = '@Fono2026';
const SESSION_KEY = 'gestao_fila_session_authenticated';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se há sessão ativa apenas na memória (não persiste ao fechar)
    const sessionActive = sessionStorage.getItem(SESSION_KEY);
    if (sessionActive === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      // Usar sessionStorage para manter apenas durante a sessão do navegador
      sessionStorage.setItem(SESSION_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
