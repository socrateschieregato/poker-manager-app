# Poker Rankings

Sistema de ranking e gerenciamento de torneios de poker.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Supabase** (PostgreSQL + Auth)
- **Tailwind CSS v4 + shadcn/ui**
- **Vercel** (deploy gratuito)

## Funcionalidades

- Ranking público com classificação geral (sem login)
- Painel admin protegido por autenticação
- CRUD de jogadores, temporadas, torneios e resultados
- Cálculo automático de ranking (pontos totais, anteriores, presenças, vitórias, pontos no dia, valor acumulado)
- Tema escuro estilo poker
- Responsivo (PC e mobile)

## Setup

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito
2. No **SQL Editor**, execute o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
3. Em **Authentication > Settings**, crie um usuário admin (email/senha)

### 2. Configurar variáveis de ambiente

Copie o `.env.local` e preencha com as credenciais do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

Essas informações estão em **Settings > API** no painel do Supabase.

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 4. Deploy na Vercel

1. Suba o código para um repositório no GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy automático a cada push

## Estrutura

```
src/
├── app/
│   ├── (public)/          # Páginas públicas (ranking)
│   └── (admin)/admin/     # Painel admin (protegido)
├── components/            # Componentes reutilizáveis
│   └── ui/                # shadcn/ui
├── lib/
│   ├── supabase/          # Clients Supabase
│   ├── actions/           # Server Actions (CRUD)
│   └── queries/           # Queries de leitura
└── types/                 # TypeScript types
```
