import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase compartilhado.
 *
 * As credenciais vêm de variáveis de ambiente (prefixo VITE_ para ficarem
 * disponíveis no bundle do cliente). Quando não configuradas, o cliente é
 * `null` e a aplicação opera apenas com localStorage ("Modo Local").
 *
 * Configure em `.env` (local) e no painel da Vercel (produção):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not configured. Using localStorage only.");
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
