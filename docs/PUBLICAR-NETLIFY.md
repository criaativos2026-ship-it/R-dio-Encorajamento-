# Publicar na Netlify

Projeto: **controle-interacao-radio** · Endereço: https://controle-interacao-radio.netlify.app

## O que já está configurado
- `netlify.toml`: build do Next.js com o adaptador oficial (automático) e Node 22.
- **Netlify Database**: criado pela Netlify na primeira publicação (pacote `@netlify/database`).
  As migrações de `netlify/database/migrations/` são aplicadas antes de cada publicação,
  incluindo os itens iniciais dos checklists.
- `AUTH_SECRET`: variável secreta já cadastrada no projeto (contexto de produção).
- Acesso de visitantes: aberto (o app tem login próprio).

## Ligar o repositório (uma vez)
1. Abra https://app.netlify.com/projects/controle-interacao-radio
2. **Project configuration → Build & deploy → Continuous deployment → Link repository**.
3. Escolha **GitHub**, autorize e selecione **R-dio-Encorajamento-**.
4. Branch: `claude/controle-interacao-visual-identity-uqm36x` (o principal do repositório).
   Comando e pasta de publicação vêm do `netlify.toml`; não precisa preencher.
5. **Deploy**. Cada novo envio para esse branch publica de novo automaticamente.

## Antes de mandar o link
1. Abra o link você primeiro: a tela **Primeiro acesso** cria a conta da gestão
   (Pastor(a), Líder ou Coordenação). Ela só aparece uma vez.
2. Em **Gestão → Pessoas**, cadastre os avaliadores e envie o e-mail e a senha provisória.

## Banco de dados: mudanças futuras
```bash
npm run db:generate   # gera a migração (drizzle/) e copia para netlify/database/migrations/
```
Nunca edite uma migração que já foi publicada; crie uma nova.
