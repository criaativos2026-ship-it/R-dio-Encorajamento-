# Controle Interação — Rádio Encorajamento

Ferramenta da equipe de serviço da **Missão Encorajamento** para organizar as transmissões da Rádio Encorajamento: checklists de montagem e desmontagem, escala do culto, central de problemas, comunicados e histórico.

A identidade visual segue o site oficial ([missaoencorajamento.com.br](https://www.missaoencorajamento.com.br/)): mesmas cores, fonte (Inter), logos e padrões de componentes. Veja [`docs/VALIDACAO-IDENTIDADE-E-STACK.md`](docs/VALIDACAO-IDENTIDADE-E-STACK.md).

## Funcionalidades

| Tela | O que faz |
|---|---|
| **Entrar** | Login com e-mail e senha. Na primeira execução, `/configurar` cria a primeira conta da gestão. |
| **Painel** | Culto em andamento, progresso da montagem e da desmontagem, problemas abertos, último comunicado, atividade recente e escala do dia. Qualquer voluntário pode abrir o culto do dia; a coordenação encerra. |
| **Montagem / Desmontagem** | Checklists por grupo. Cada item marcado registra quem marcou e quando. O aviso "Importante" aparece no topo da desmontagem. |
| **Central** | Registro de problemas com prioridade, resolução com observação e mural de comunicados (a coordenação publica e fixa). |
| **Histórico** | Linha do tempo de tudo o que foi feito, agrupada por dia. |
| **Gestão** (pastor, líder, coordenação) | Visão geral e **relatório de cada culto** (escala, quem marcou cada item e quando, problemas, pendências, linha do tempo, impressão/PDF), cadastro de pessoas e perfis, e edição dos checklists. |
| **Perfil** | Nome, função principal, troca de senha e saída. |

## Perfis de acesso

| Perfil | Acesso |
|---|---|
| **Pastor(a)**, **Líder**, **Coordenação** | Área de Gestão: acompanham tudo e alteram o app (pessoas, perfis, checklists, comunicados, encerrar culto). Mesmas permissões; muda só o nome exibido. |
| **Voluntário(a)** | Dia a dia: abre o culto, entra na escala, marca os checklists, registra e resolve problemas, lê comunicados e o histórico. |

O app sempre mantém pelo menos uma pessoa ativa na gestão.

## Stack

Mesma base do site da igreja:

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **shadcn/ui** (Radix UI) em `src/components/ui/`, com as mesmas variáveis (`--primary`, `--muted`, `--radius`…) e a mesma escala de bordas do site
- **Tailwind CSS v4** ligado aos design tokens oficiais (`design/tokens.css`)
- Avisos rápidos com **Sonner** e confirmações com o **Alert Dialog** do shadcn
- Ícones **Lucide** e fonte **Inter** (`next/font`)
- **PostgreSQL** + **Drizzle ORM** (migrações versionadas em `drizzle/`)
- **Auth.js** (login com credenciais, senhas com bcrypt, limite de tentativas)
- **Zod** para validar toda entrada no servidor

## Rodar localmente

Requisitos: Node.js 20+ e PostgreSQL 14+.

```bash
npm install
cp .env.example .env.local      # preencha DATABASE_URL e AUTH_SECRET
npm run db:migrate              # cria as tabelas e os itens iniciais dos checklists
npm run dev                     # http://localhost:3000
```

No primeiro acesso, o app abre `/configurar` para criar a conta da coordenação.

## Publicar em produção

```bash
npm ci
npm run db:migrate
npm run build
npm run start                   # porta 3000 (use PORT=xxxx para mudar)
```

- `AUTH_SECRET`: gere com `openssl rand -base64 32` e guarde em local seguro.
- `AUTH_TRUST_HOST=true` quando o app estiver atrás de proxy (OpenResty/nginx, como o site).
- Use **HTTPS**. O app pode ser instalado na tela inicial do celular (PWA).
- Funciona em qualquer hospedagem Node.js com PostgreSQL (servidor próprio com Docker, Vercel + Neon/Supabase etc.).

### Netlify (link de avaliação)

Publicado em **https://controle-interacao-radio.netlify.app** com Netlify Database. Passo a passo em [`docs/PUBLICAR-NETLIFY.md`](docs/PUBLICAR-NETLIFY.md).

## Estrutura

```
design/tokens.css        Cores, fonte, bordas e espaçamentos oficiais (fonte única)
drizzle/                 Migrações do banco
scripts/                 migrate.ts, sync-netlify-migrations.mjs
netlify/database/        Migrações aplicadas pela Netlify
src/app/(auth)/          Entrar, primeiro acesso
src/app/(app)/           Painel, checklist/[tipo], central, historico, equipe, perfil
src/app/actions/         Ações do servidor (validação + permissão + histórico)
src/components/ui/       Componentes shadcn/ui (button, input, card, badge, checkbox, progress,
                         alert-dialog, dropdown-menu, collapsible, avatar, sonner…)
src/components/          Componentes do app montados com o shadcn (panel, form, confirm-button…)
src/db/schema.ts         Estrutura do banco
src/lib/                 Sessão, consultas, datas (fuso de São Paulo), constantes
public/                  Logos oficiais (sem alteração)
```

## Padrões visuais

- **Laranja #FF5C35**: ação e atenção (botões, em andamento, problemas abertos).
- **Preto-grafite #1D1D1B**: concluído e resolvido. Não há cores fora da paleta do site.
- Para mudar qualquer cor, fonte ou borda, edite só `design/tokens.css`.

## Componentes shadcn/ui

Os componentes seguem o estilo *new-york* do shadcn (`components.json`) e foram escritos no projeto
porque o instalador oficial não tinha acesso a `ui.shadcn.com` no ambiente de desenvolvimento.
Com acesso liberado, compare com a versão oficial e adicione novos componentes assim:

```bash
npx shadcn@latest diff          # mostra diferenças em relação ao registro oficial
npx shadcn@latest add <nome>    # adiciona um componente novo
```

As variantes da marca (`brandOutline`, `ink`, `outlineLight` no botão; `brand` na badge) ficam no
próprio componente, como o shadcn recomenda.
