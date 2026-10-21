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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 [background-image:radial-gradient(60rem_30rem_at_50%_-10%,rgba(0,91,170,0.18),transparent)]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-3xl border border-border p-8 sm:p-10 shadow-[0_1px_2px_rgba(18,48,77,0.04),0_24px_48px_-24px_rgba(18,48,77,0.25)]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-foreground">Fila de Fonoaudiologia</h1>
            <p className="text-muted-foreground mt-2">Digite a senha da equipe para entrar.</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="font-bold">
                Senha de acesso
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="h-12 rounded-xl pr-12"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
              className="w-full h-12 rounded-full font-bold text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Gestão da fila de fonoaudiologia do SUS
            </p>
          </div>
        </div>

        {/* Informação */}
        <div className="mt-6 text-center text-muted-foreground text-sm">
          <p>Acesso restrito a usuários autorizados</p>
        </div>
      </div>
    </div>
  );
}
