# Gestão de Fila — Fonoaudiologia

App web (SPA) para a fila de espera de fonoaudiologia de uma rede de saúde (identidade visual SUS).
Usuários são colaboradores leigos em tecnologia: textos da interface em português simples, sem jargão.

**Stack:** React 19 + TypeScript, Vite 7, Tailwind 4 + shadcn/ui, Supabase (Postgres + Realtime), jsPDF + jspdf-autotable, wouter.
**Não é Next.js** — variáveis públicas usam prefixo `VITE_`, não `NEXT_PUBLIC_`.

## Comandos

```bash
pnpm install
pnpm run dev        # http://localhost:3000 (sem .env roda em "Modo Local")
pnpm run check      # tsc --noEmit
npx vitest run      # testes (client/src/lib/*.test.ts)
pnpm run build      # saída em dist/public
```

- Se `pnpm` não estiver no PATH: `npx --yes pnpm@10.4.1 run <script>` (é o que `.claude/launch.json` usa).
- Sempre rode `npx vitest run` e `pnpm run check` antes de commitar.
- `PDF_OUT=caminho.pdf npx vitest run exportPDF` grava o PDF de teste para inspeção visual.

## Arquitetura

```
client/src/
  types/index.ts          # Paciente, STATUS_LIST (fonte única de status e ordem), PROFISSIONAIS
  lib/fila.ts             # ordenação, numeração por status, tempo de espera (lógica pura, testada)
  lib/exportPDF.ts        # PDF A4 paisagem; colunas Status/Profissional somem quando não variam
  lib/masks.ts            # máscaras CPF, CNS, telefone, datas
  contexts/SupabaseContext.tsx  # CRUD + Realtime; fallback localStorage
  contexts/AuthContext.tsx      # portão de senha no cliente (sessionStorage)
  components/FormularioCadastro.tsx  # cadastro/edição
  components/TabelaPacientes.tsx     # filtros, tabela (desktop), cartões (celular), diálogos
  pages/Home.tsx          # liga contexto ↔ componentes
supabase/schema.sql       # schema + RLS + Realtime (rodar no SQL Editor do Supabase)
server/index.ts           # Express opcional para self-host; a Vercel não usa
```

## Regras de negócio

- **Datas são texto `DD/MM/AAAA`**, não `Date`/ISO. Use as máscaras e os helpers de `lib/fila.ts`.
- **Data de Admissão** = campo `data` do banco. Define a ordem da fila (desempate: `created_at`, depois `id`).
- **Nº/Posição** é calculado na hora (`numerarPorStatus`), nunca salvo. Em "Aguardando" é a posição na fila.
- **Tempo de Espera** = hoje − Data de Admissão, em dias (`formatarEspera`). Calculado, não salvo.
- **Alta** exige **Data da Alta** (`dataAlta`): no formulário aparece um campo; na troca rápida de status da tabela abre um diálogo (sugere hoje).
- **Observações** = coluna `diagnostico` no banco (só o rótulo mudou; máx. 180 caracteres).
- **Profissional** fica salvo para qualquer status exceto "Aguardando" (mantém histórico após alta).
- Para adicionar/renomear status, edite só `STATUS_LIST` e `STATUS_COLORS` (`TabelaPacientes.tsx`).

## Banco (Supabase)

- Colunas em camelCase **com aspas** (`"dataNascimento"`, `"dataAlta"`) para casar com as chaves do app.
- **Coluna nova no `Paciente` = migração obrigatória**: adicione `alter table ... add column if not exists` em `supabase/schema.sql` e avise o usuário para rodar no SQL Editor **antes** do deploy — senão o insert/update falha e o app mostra "Não foi possível salvar no servidor".
- Inserts/updates enviam o objeto inteiro; campos `undefined` são omitidos (não limpam o valor no banco).
- O estado é atualizado pela assinatura Realtime, não pela resposta do insert/update.

## Ambiente e deploy

- `.env` (ver `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon ou publishable). Sem eles: Modo Local.
- Deploy na Vercel via `vercel.json` (build `pnpm run build`, saída `dist/public`, rewrite SPA). Push na `main` dispara o deploy.
- Mesmas variáveis em Vercel → Settings → Environment Variables.

## Gotchas

- `.gitattributes` força LF; scripts no Windows que regravam arquivos podem gerar CRLF — normalize.
- A senha do portão está no bundle (`AuthContext.tsx`): é barreira casual, não autenticação real. RLS libera tudo para `anon`.
- Dados de pacientes são sensíveis (CPF, CNS): nunca use dados reais em testes, logs ou commits.
- Testes de navegador em Modo Local: autentique com `sessionStorage.gestao_fila_session_authenticated = "true"` e semeie `localStorage.gestao_fila_pacientes`.
