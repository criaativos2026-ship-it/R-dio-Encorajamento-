# Autenticação, perfis e permissões

## Auth.js (credenciais)

`src/auth.ts`:
- Provider `Credentials` com `authorize` que valida com Zod, normaliza o e-mail (minúsculas), checa `active` e compara com `bcrypt.compare`.
- **Limite de tentativas** por e-mail (ex.: 8 falhas em 15 min) — lance uma subclasse de `CredentialsSignin` com `code = "muitas_tentativas"` para mostrar mensagem própria.
- `session: { strategy: "jwt" }`, `pages: { signIn: "/entrar" }`, `trustHost: true` (necessário atrás de proxy, ex.: Netlify).
- Callbacks `jwt`/`session` só guardam o `id` do usuário.
- Rota `src/app/api/auth/[...nextauth]/route.ts` exporta `GET`/`POST` de `handlers`.
- Senhas: `bcrypt.hash(senha, 12)`; mínimo 8 caracteres.

## Sessão conferida no banco

`src/lib/session.ts`:
```ts
export const getCurrentUser = cache(async () => {
  const id = (await auth())?.user?.id; if (!id) return null;
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return u && u.active ? u : null;           // conta desativada perde acesso NA HORA
});
export async function requireUser() {
  const u = await getCurrentUser(); if (!u) redirect("/entrar");
  if (!hasAcceptedPrivacy(u)) redirect("/aceite");   // LGPD
  return u;
}
export const isGestao = (u) => PERFIS_GESTAO.includes(u.role);
export async function requireGestao() { const u = await requireUser(); if (!isGestao(u)) redirect("/"); return u; }
```
Use `requireUser`/`requireGestao` no topo de **toda** página e **toda** ação do servidor.

## Perfis

- Enum no banco com os perfis do cliente (ex.: `pastor`, `lider`, `coordenacao`, `voluntario`). Rótulos em `PERFIL_LABEL`. Grupo `PERFIS_GESTAO` com quem gerencia.
- Quando o cliente quer vários nomes com as mesmas permissões, use um grupo (gestão) em vez de regras separadas.
- **Nunca deixar a gestão vazia**: antes de rebaixar, desativar ou anonimizar alguém da gestão, conte as outras pessoas ativas na gestão; se for zero, recuse com mensagem clara.
- Ninguém desativa/exclui a própria conta.
- Seletor de perfil por pessoa (NativeSelect) na tela de Pessoas.

## Primeiro acesso e cadastro

- Sem cadastro aberto. `/configurar` só funciona com **zero usuários** (checar na página e na ação; página com `await connection()` para não ficar estática). Cria a primeira conta da gestão (o usuário escolhe o perfil) e faz login.
- A gestão cadastra pessoas com senha provisória; a pessoa troca a senha em Perfil.
- Quando não se sabe o e-mail de alguém (ex.: avaliadores), use logins provisórios com domínio reservado `@example.com` e oriente a trocar a senha.

## Tela de login

- E-mail preservado após senha errada (o React 19 limpa o formulário — devolva o e-mail no estado da ação).
- Link para o aviso de privacidade.
- Redirecionar para `/configurar` se não houver usuários; para `/` se já logado.

## Histórico de atividades

Tabela `activities (type enum, message, user_id, service/contexto_id, created_at)` e `logActivity(type, message, userId, contextoId?)`. Registre: abrir/encerrar, marcar/desmarcar, concluir, problemas, comunicados, cadastro de pessoas, mudanças de perfil, ações de privacidade. A lista mostra ícone por tipo, autor e "Hoje, 08h14".

## Padrões de regra de negócio que o usuário pediu

- **Data/hora automáticas**: o servidor grava `new Date()` e `todayISO()`/`clockNow()` no fuso do cliente; o formulário não tem campos de data/hora e mostra "registrado automaticamente pelo sistema".
- **Sequência obrigatória** (etapa B só depois da A): helper `isEtapaAConcluida(id)` usado na ação do servidor (recusa com mensagem) **e** na página (aviso "Bloqueada", progresso da etapa A, atalho para ela, itens desativados) e no painel (cadeado + "faltam N etapas").
- **Marcação otimista** em listas (checklists): `useOptimistic` + `useTransition`, erro vira toast; cada item mostra quem marcou e quando.
- **Encerramento** de um ciclo (ex.: culto/evento) só pela gestão, com confirmação que avisa pendências.
