# Stack e estrutura

## Antes de escrever código

- Instale a **versão estável mais recente** do Next.js e leia a documentação que vem dentro do pacote (`node_modules/next/dist/docs/`) para mudanças de versão. Exemplos do Next 16: o arquivo `middleware` virou `proxy`; `params` e `searchParams` das páginas são `Promise` (use `await`); `revalidatePath`, `updateTag`, `refresh` vêm de `next/cache`.
- Não dependa do `proxy` para autenticação: confira a sessão no **layout** e em **cada ação do servidor** (é o que o guia de autenticação do Next recomenda).

## Dependências

```bash
npm install next react react-dom next-auth@beta drizzle-orm postgres zod bcryptjs lucide-react \
  radix-ui class-variance-authority clsx tailwind-merge sonner server-only
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss \
  tw-animate-css drizzle-kit tsx eslint eslint-config-next
```

`package.json`: `"type": "module"` (os scripts com `await` no topo precisam disso). Scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "db:generate": "drizzle-kit generate && node scripts/sync-netlify-migrations.mjs",
  "db:migrate": "tsx scripts/migrate.ts",
  "build:producao": "npm run db:migrate && next build"
}
```

## Estrutura de pastas

```
design/tokens.css            Tokens de identidade (cores, fontes, bordas, espaçamento) — fonte única
drizzle/                     Migrações geradas (com meta/_journal.json)
netlify/database/migrations/ Cópia das migrações que a Netlify aplica a cada publicação
scripts/                     migrate.ts, sync-netlify-migrations.mjs
public/                      Logos originais (sem alterar), vídeos, ícones
src/app/(auth)/              entrar, configurar (primeiro acesso)
src/app/(app)/               telas logadas (layout com cabeçalho + barra de abas)
src/app/(app)/gestao/        área de gestão (layout com abas e requireGestao)
src/app/actions/             ações do servidor ("use server"): validação + permissão + histórico
src/app/api/                 rotas (ex.: auth, exportação de dados)
src/app/privacidade, aceite  LGPD (fora do grupo (app))
src/components/ui/           componentes shadcn
src/components/              componentes do app montados com shadcn (panel, form, confirm-button…)
src/db/schema.ts, index.ts   banco
src/lib/                     session, queries, format (datas/fuso), constants, privacidade, retencao, utils (cn)
```

## Arquivos de configuração

**tsconfig**: `strict`, `moduleResolution: "bundler"`, alias `@/*` → `./src/*`.

**next.config.ts**: `poweredByHeader: false` e cabeçalhos de segurança:
```ts
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
export default { poweredByHeader: false, async headers() { return [{ source: "/:path*", headers: securityHeaders }]; } };
```

**eslint.config.mjs** (atribua a uma variável antes de exportar, senão o lint reclama):
```js
import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";
const config = [...next, ...ts, { ignores: [".next/**", "node_modules/**", "drizzle/**"] }];
export default config;
```

**.gitignore**: `node_modules/ .next/ .env .env*.local *.tsbuildinfo next-env.d.ts .netlify`.

**.env.example** (commitado) e **.env.local** (nunca commitado): `DATABASE_URL`, `AUTH_SECRET` (gere com `openssl rand -base64 32`), `AUTH_TRUST_HOST=true`.

## Tokens + Tailwind v4 + shadcn

1. `design/tokens.css` define as variáveis da marca **do projeto atual** (prefixo do projeto, ex.: `--me-brand`, `--me-ink`, `--me-bg`, `--me-radius`…), cada uma com comentário dizendo de onde veio. Valores não confirmados ficam marcados como `PROVISÓRIO`.
2. `src/app/globals.css`:
   ```css
   @import "tailwindcss";
   @import "tw-animate-css";
   @import "../../design/tokens.css";
   :root { /* variáveis do shadcn apontando para os tokens */
     --radius: var(--x-radius); --background: var(--x-bg); --foreground: var(--x-ink);
     --primary: var(--x-brand); --primary-foreground: var(--x-on-brand);
     --muted: var(--x-bg-alt); --muted-foreground: var(--x-muted-fg);
     --border: var(--x-border); --input: var(--x-border); --ring: var(--x-brand); /* … */ }
   @theme inline { --color-primary: var(--primary); /* … */
     --radius-sm: calc(var(--radius) * 0.6); --radius-md: calc(var(--radius) * 0.8);
     --radius-lg: var(--radius); --radius-xl: calc(var(--radius) * 1.4); --radius-2xl: calc(var(--radius) * 1.8); }
   ```
   Muitos sites modernos já usam exatamente os nomes do shadcn (`--primary`, `--muted`, `--radius`) e essa escala de bordas — confira no CSS do site de referência e reaproveite.
3. Para mudar a identidade, edita-se **só** `design/tokens.css`.

## Fonte: Inter (padrão aprovado pelo usuário)

Todos os sistemas usam **Inter**, carregada pelo `next/font` (sem arquivo externo nem atraso de carregamento):

```tsx
// src/app/layout.tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// <html lang="pt-BR" className={inter.variable}> … <body className="font-sans">
```
```css
/* globals.css */
@theme inline { --font-sans: var(--font-inter), system-ui, -apple-system, sans-serif; }
```

Pesos variáveis (100–900) já vêm inclusos: títulos fortes costumam ficar bem em 800–900 com `letter-spacing` levemente negativo; texto em 400–600. Para números e rótulos técnicos, a monoespaçada do sistema (`ui-monospace, SFMono-Regular, Menlo, …`) combina bem.

Use outra fonte **só** se o usuário pedir, ou se o site de referência do projeto tiver fonte própria **e** o usuário confirmar a troca.

## Banco (Drizzle + postgres-js)

`src/db/index.ts` — conexão **preguiçosa** (o build não pode depender do banco) e compatível com poolers:
```ts
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL;
if (!url) console.warn("[db] Nenhuma conexão configurada.");
const g = globalThis as unknown as { pg?: ReturnType<typeof postgres> };
const client = g.pg ?? postgres(url ?? "postgres://indefinido@localhost/indefinido", { max: 5, prepare: false });
if (process.env.NODE_ENV !== "production") g.pg = client;
export const db = drizzle(client, { schema });
```

Modelagem: `uuid` com `defaultRandom()`, `timestamp(..., { withTimezone: true }).defaultNow()`, enums com `pgEnum`, índices nas colunas de filtro/ordenação, `onDelete` explícito. E-mails sempre em minúsculas (`z.string().trim().toLowerCase().email()`).

Dados iniciais (ex.: itens padrão) entram como **migração SQL personalizada** (`drizzle-kit generate --custom --name nome`) que só insere se a tabela estiver vazia — assim funcionam em qualquer ambiente e na Netlify:
```sql
INSERT INTO "tabela" ("a","b") SELECT v.a, v.b FROM (VALUES ('x','y')) AS v(a,b)
WHERE NOT EXISTS (SELECT 1 FROM "tabela");
```

Depois de gerar, dê um **nome descritivo** à migração (renomeie o arquivo e a `tag` em `drizzle/meta/_journal.json`) enquanto ela ainda não foi publicada. Nunca edite uma migração já aplicada; crie outra.

`scripts/sync-netlify-migrations.mjs` copia `drizzle/NNNN_nome.sql` para `netlify/database/migrations/` e falha se uma já copiada tiver mudado.

## Datas e fuso

Centralize em `src/lib/format.ts` com `Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" })`: `todayISO()`, `clockNow()` (HH:MM do servidor), `when()` ("Hoje, 08h14", "Ontem, …"), `greeting()` (Bom dia/tarde/noite). O servidor roda em UTC; nunca use `new Date().getHours()` direto.

## Ações do servidor (padrão)

```ts
"use server";
export async function criarAlgo(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();                  // ou requireGestao()
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  /* regra de negócio + db */
  await logActivity("tipo", "Mensagem legível", user.id);
  revalidatePath("/", "layout");
  return { ok: "Mensagem de sucesso." };
}
```
`FormState = { error?: string; ok?: string; email?: string } | undefined`. No cliente: `useActionState`. **O React 19 limpa o formulário após a ação**: devolva no estado os valores que o usuário não deve redigitar (ex.: o e-mail após senha errada) e use `defaultValue` + `key`.

## Componentes de servidor x cliente

Páginas e consultas no servidor. `"use client"` só para interação (formulários, checklists otimistas com `useOptimistic`, menus, diálogos, vídeo). Telas que consultam o banco a cada acesso e não leem cookies devem chamar `await connection()` (de `next/server`) para não virarem estáticas no build — confira a saída do build (`○` estático × `ƒ` dinâmico).
