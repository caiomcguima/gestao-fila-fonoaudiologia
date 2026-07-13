# Gestão de Fila — Fonoaudiologia

Sistema web para gestão da fila de espera de atendimentos de fonoaudiologia,
seguindo a identidade visual do **Sistema Único de Saúde (SUS)**.

Permite cadastrar, editar, filtrar e acompanhar pacientes, com **sincronização
em nuvem via Supabase** — as alterações feitas em um desktop aparecem em tempo
real em qualquer outro acesso. Sem credenciais Supabase configuradas, o app
opera em **Modo Local** (apenas `localStorage`, sem sincronização).

## Tecnologias

- **React 19** + **TypeScript**
- **Vite 7** (build e dev server)
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase** (Postgres + Realtime) para persistência e sincronização
- **jsPDF** + **html2canvas** para exportação em PDF
- **wouter** para roteamento

## Funcionalidades

- **Autenticação** por senha de acesso (portão simples no cliente)
- **Cadastro/edição** de pacientes: nome, telefone, data, data de nascimento,
  CPF, CNS, UBS, status, profissional e diagnóstico (máx. 180 caracteres)
- **Máscaras automáticas** para CPF, CNS, telefone e datas
- **5 status**: Aguardando, Em Atendimento, Cancelado, Perdeu a Vaga, Alta
- **Seleção de fonoaudióloga** quando o status é "Em Atendimento"
- **Busca** por nome, CPF, CNS ou data de nascimento, e **filtro por status**
- **Exportação para PDF** da fila (completa ou filtrada)
- **Indicador de sincronização** no cabeçalho (Sincronizado / Modo Local)

## Pré-requisitos

- **Node.js** 20+ (recomendado 22/24)
- **pnpm** (o projeto usa pnpm com lockfile e um patch de dependência)

  ```bash
  corepack enable      # habilita o pnpm que acompanha o Node
  # ou: npm install -g pnpm
  ```

## Instalação e execução local

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite o .env com as credenciais do Supabase (ver seção abaixo)

# 3. Iniciar o servidor de desenvolvimento
pnpm run dev
```

A aplicação abre em `http://localhost:3000`.

> Sem `.env` configurado o app roda normalmente em **Modo Local**.

## Configuração do Supabase (sincronização em nuvem)

Para que os dados sejam compartilhados entre dispositivos:

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No painel, abra **SQL Editor**, cole o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e execute (**Run**). Isso cria a
   tabela `pacientes`, habilita o Realtime e define as políticas de acesso.
3. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.
4. Preencha o `.env` (e as variáveis na Vercel):

   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

Ao iniciar com as credenciais válidas, o cabeçalho mostrará **"Sincronizado"**.

## Scripts

| Script          | Descrição                                            |
| --------------- | ---------------------------------------------------- |
| `pnpm run dev`  | Servidor de desenvolvimento (porta 3000)             |
| `pnpm run build`| Build de produção (saída em `dist/public`)           |
| `pnpm run preview` | Pré-visualiza o build de produção localmente      |
| `pnpm run check`| Verificação de tipos com TypeScript                  |
| `pnpm run format`| Formata o código com Prettier                       |

## Deploy na Vercel

O projeto já inclui [`vercel.json`](vercel.json) com a configuração de build e o
rewrite de SPA (necessário para o roteamento client-side).

1. Faça push do repositório para o GitHub.
2. Em [vercel.com](https://vercel.com), **New Project > Import** o repositório.
3. A Vercel detecta o `vercel.json` automaticamente:
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist/public`
4. Em **Settings > Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**.

## Estrutura do projeto

```
.
├── client/
│   ├── index.html
│   └── src/
│       ├── components/        # FormularioCadastro, TabelaPacientes, ui/ (shadcn)
│       ├── contexts/          # Auth, Edit, Supabase, Theme
│       ├── hooks/             # useComposition, useMobile, usePersistFn
│       ├── lib/               # supabase, masks, exportPDF, utils
│       ├── pages/             # Home, Login, NotFound
│       ├── types/             # tipos (Paciente, StatusPaciente, ...)
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/                    # servidor Express opcional (self-host)
├── supabase/schema.sql        # schema do banco (rodar no Supabase)
├── vercel.json
├── vite.config.ts
└── package.json
```

## Segurança — observações

- A senha de acesso é um **portão no lado do cliente** e fica visível no bundle.
  Serve para restringir acesso casual, não como autenticação forte.
- A `anon key` do Supabase é pública por design; as políticas em
  `supabase/schema.sql` liberam leitura/escrita para essa chave. Para um
  ambiente com dados sensíveis reais, considere autenticação de usuários do
  Supabase e políticas RLS mais restritivas.
- Nunca faça commit do arquivo `.env` (já está no `.gitignore`).
