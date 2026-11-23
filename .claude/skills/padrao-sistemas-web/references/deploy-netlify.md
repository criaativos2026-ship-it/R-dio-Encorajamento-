# Publicar na Netlify (com Netlify Database)

## Preparar o projeto

`netlify.toml` (o adaptador de Next.js é aplicado automaticamente):
```toml
[build]
  command = "npm run build"
  publish = ".next"
[build.environment]
  NODE_VERSION = "22"
```
- Instale `@netlify/database` — sem ele a Netlify **não** cria o banco sozinha.
- Migrações em `netlify/database/migrations/NNNN_nome.sql` (a Netlify aplica antes de publicar; falha bloqueia a publicação). Mantenha `drizzle/` como origem e copie com `scripts/sync-netlify-migrations.mjs`. Nunca rode `drizzle-kit push`/`migrate` contra o banco da Netlify; nunca edite migração aplicada.
- O app lê `DATABASE_URL ?? NETLIFY_DB_URL`; conexão preguiçosa e `prepare: false` (veja `stack-e-estrutura.md`). O build não pode exigir banco.
- Auth.js com `trustHost: true`.
- Adicione `.netlify` ao `.gitignore`.

## Com o conector da Netlify (MCP) disponível

1. Leia o contexto (`get-netlify-coding-context` para `netlify-deploy` e `netlify-database`).
2. `get-teams` → `create-new-project` com nome em hífens.
3. **Desligue a exigência de login da Netlify para visitantes** (`update-visitor-access-controls` com `requireSSOTeamLogin: false`) — por padrão projetos novos podem exigir login de equipe e bloquear os avaliadores. O app já tem login próprio.
4. Variável secreta `AUTH_SECRET` (`manage-env-vars`, `envVarIsSecret: true`). Segredo não aceita contexto `all` (erro 422): use `production` (e outros contextos se forem usados). Gere o valor localmente, envie e apague a cópia local; não mostre ao usuário.
5. Publicação:
   - Se a rede permitir `api.netlify.com`/`mcp.netlify.com`, use `deploy-site` a partir de uma **cópia limpa** (`git archive HEAD | tar -x -C pasta`), para não enviar `.env.local`. Em ambientes com proxy, o Node precisa de `NODE_USE_ENV_PROXY=1`.
   - Se estiver bloqueado: peça ao usuário para ligar o repositório pela interface (funciona no celular): projeto → **Manage → Build and deploy → Repository → Connect an existing repository** (não "Push to GitHub") → GitHub → repositório → branch → publicar. Depois disso, cada `git push` publica sozinho.
6. Confirme com `get-project` / `get-deploy-for-site`: `state: ready`, `database_migrations` aplicadas, `secret_scan_result` sem ocorrências.

## Avisar o usuário

- O link (`https://<projeto>.netlify.app`) e que a primeira pessoa a abrir vê o **Primeiro acesso** — ele deve criar a conta dele antes de divulgar.
- O botão "Ask the agent"/"agent run" da Netlify consome créditos: não precisa usar.
- O selo "Powered by Netlify" pode cobrir a barra inferior no celular; ofereça tirar/reposicionar.
- Se o repositório estiver público, o código fica visível (dados não): recomende torná-lo privado.
- Alterações futuras: cada push no branch de produção republica automaticamente.
