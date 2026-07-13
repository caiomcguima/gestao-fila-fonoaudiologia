import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular delay de validação
    setTimeout(() => {
      if (login(password)) {
        toast.success('Autenticado com sucesso!');
        setPassword('');
      } else {
        toast.error('Senha incorreta!');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">GESTÃO DE FILA</h1>
            <p className="text-sm text-muted-foreground mt-2">Fonoaudiologia</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha de Acesso
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="text-sm pr-10"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Sistema de Gestão de Fila de Fonoaudiologia - SUS
            </p>
          </div>
        </div>

        {/* Informação */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>Acesso restrito a usuários autorizados</p>
        </div>
      </div>
    </div>
  );
}
