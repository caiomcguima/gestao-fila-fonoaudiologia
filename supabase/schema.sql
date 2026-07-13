-- =============================================================================
-- Schema do banco de dados — Gestão de Fila Fonoaudiologia
-- =============================================================================
-- Execute este script no seu projeto Supabase:
--   Painel do Supabase > SQL Editor > New query > cole e execute (Run).
--
-- Ele cria a tabela `pacientes`, habilita sincronização em tempo real e
-- define políticas de acesso para a chave pública (anon), já que o app usa
-- um portão de senha no cliente e não autenticação por usuário do Supabase.
-- =============================================================================

-- 1) Tabela de pacientes
-- Os nomes das colunas usam aspas para preservar camelCase, casando exatamente
-- com as chaves enviadas pelo aplicativo (ex.: "dataNascimento").
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null default '',
  telefone text not null default '',
  data text not null default '',
  "dataNascimento" text not null default '',
  cpf text not null default '',
  cns text not null default '',
  ubs text not null default '',
  status text not null default 'Aguardando',
  profissional text,
  diagnostico text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 2) Habilitar Row Level Security
alter table public.pacientes enable row level security;

-- 3) Políticas de acesso para a role anônima (anon)
--    Acesso total de leitura/escrita, pois o controle de acesso é feito pela
--    senha no cliente. Ajuste conforme sua necessidade de segurança.
drop policy if exists "Acesso público de leitura" on public.pacientes;
create policy "Acesso público de leitura"
  on public.pacientes for select
  to anon, authenticated
  using (true);

drop policy if exists "Acesso público de inserção" on public.pacientes;
create policy "Acesso público de inserção"
  on public.pacientes for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Acesso público de atualização" on public.pacientes;
create policy "Acesso público de atualização"
  on public.pacientes for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Acesso público de exclusão" on public.pacientes;
create policy "Acesso público de exclusão"
  on public.pacientes for delete
  to anon, authenticated
  using (true);

-- 4) Habilitar sincronização em tempo real (Realtime) para a tabela
alter publication supabase_realtime add table public.pacientes;
