# Controle Interação — Rádio Encorajamento

Ferramenta da equipe de serviço da **Missão Encorajamento** para organizar as transmissões da Rádio Encorajamento: checklists de montagem e desmontagem, escala do culto, central de problemas, comunicados e histórico.

A identidade visual segue o site oficial ([missaoencorajamento.com.br](https://www.missaoencorajamento.com.br/)): mesmas cores, fonte (Inter), logos e padrões de componentes. Veja [`docs/VALIDACAO-IDENTIDADE-E-STACK.md`](docs/VALIDACAO-IDENTIDADE-E-STACK.md).

## Funcionalidades

| Tela | O que faz |
|---|---|
| **Entrar** | Login com e-mail e senha. Na primeira execução, `/configurar` cria a conta da coordenação. |
| **Painel** | Culto em andamento, progresso da montagem e da desmontagem, problemas abertos, último comunicado, atividade recente e escala do dia. Qualquer voluntário pode abrir o culto do dia; a coordenação encerra. |
| **Montagem / Desmontagem** | Checklists por grupo. Cada item marcado registra quem marcou e quando. O aviso "Importante" aparece no topo da desmontagem. |
| **Central** | Registro de problemas com prioridade, resolução com observação e mural de comunicados (a coordenação publica e fixa). |
| **Histórico** | Linha do tempo de tudo o que foi feito, agrupada por dia. |
| **Equipe** (coordenação) | Cadastro de voluntários, perfil de acesso, senha provisória, desativação de contas e edição dos itens dos checklists. |
| **Perfil** | Nome, função principal, troca de senha e saída. |

## Stack

Mesma base do site da igreja:

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** ligado aos design tokens oficiais (`design/tokens.css`)
- Ícones **Lucide** e fonte **Inter** (`next/font`)
- **PostgreSQL** + **Drizzle ORM** (migrações versionadas em `drizzle/`)
- **Auth.js** (login com credenciais, senhas com bcrypt, limite de tentativas)
- **Zod** para validar toda entrada no servidor

## Rodar localmente

Requisitos: Node.js 20+ e PostgreSQL 14+.

```bash
npm install
cp .env.example .env.local      # preencha DATABASE_URL e AUTH_SECRET
npm run db:migrate              # cria as tabelas
npm run db:seed                 # cria os itens dos checklists (só se estiver vazio)
npm run dev                     # http://localhost:3000
```

No primeiro acesso, o app abre `/configurar` para criar a conta da coordenação.

## Publicar em produção

```bash
npm ci
npm run db:migrate
npm run db:seed
npm run build
npm run start                   # porta 3000 (use PORT=xxxx para mudar)
```

- `AUTH_SECRET`: gere com `openssl rand -base64 32` e guarde em local seguro.
- `AUTH_TRUST_HOST=true` quando o app estiver atrás de proxy (OpenResty/nginx, como o site).
- Use **HTTPS**. O app pode ser instalado na tela inicial do celular (PWA).
- Funciona em qualquer hospedagem Node.js com PostgreSQL (servidor próprio com Docker, Vercel + Neon/Supabase etc.).

## Estrutura

```
design/tokens.css        Cores, fonte, bordas e espaçamentos oficiais (fonte única)
drizzle/                 Migrações do banco
scripts/                 migrate.ts, seed.ts
src/app/(auth)/          Entrar, primeiro acesso
src/app/(app)/           Painel, checklist/[tipo], central, historico, equipe, perfil
src/app/actions/         Ações do servidor (validação + permissão + histórico)
src/components/ui/       Componentes reutilizáveis (botão, painel, campos, tags, progresso…)
src/db/schema.ts         Estrutura do banco
src/lib/                 Sessão, consultas, datas (fuso de São Paulo), constantes
public/                  Logos oficiais (sem alteração)
```

## Padrões visuais

- **Laranja #FF5C35**: ação e atenção (botões, em andamento, problemas abertos).
- **Preto-grafite #1D1D1B**: concluído e resolvido. Não há cores fora da paleta do site.
- Para mudar qualquer cor, fonte ou borda, edite só `design/tokens.css`.
