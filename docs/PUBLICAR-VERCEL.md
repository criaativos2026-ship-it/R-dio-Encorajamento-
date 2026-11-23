# Publicar para avaliação (Vercel + Neon)

Gera um link do tipo `https://controle-interacao.vercel.app` para a equipe testar. Gratuito e possível de fazer pelo celular.

## 1. Criar o projeto na Vercel
1. Acesse **vercel.com** e entre com a conta do **GitHub** (*Continue with GitHub*).
2. **Add New… → Project** e importe o repositório **R-dio-Encorajamento-**.
   - Se ele não aparecer, toque em *Adjust GitHub App Permissions* e libere o repositório.
3. Antes de publicar, abra **Environment Variables** e adicione:
   - `AUTH_SECRET`: um texto aleatório e longo (mínimo de 32 caracteres). Pode gerar em um gerador de senhas. Não compartilhe.
4. Toque em **Deploy**. A primeira tentativa pode falhar por falta do banco; é normal, o passo 2 resolve.

## 2. Criar o banco de dados (Neon)
1. No projeto da Vercel: **Storage → Create Database → Neon (Serverless Postgres)** → plano gratuito, região **São Paulo (gru1)** se disponível.
2. Conecte o banco ao projeto (a Vercel cria a variável `DATABASE_URL` sozinha).
3. Vá em **Deployments**, abra o último e toque em **Redeploy**.

A cada publicação, o script `vercel-build` cria/atualiza as tabelas, cadastra os itens dos checklists (só na primeira vez) e gera o app.

## 3. Antes de enviar o link
1. Abra o link você mesmo **primeiro**: ele mostra a tela **Primeiro acesso**. Crie a sua conta (Pastor(a), Líder ou Coordenação).
   - Essa tela só aparece uma vez; depois disso, ninguém mais consegue usá-la.
2. Em **Gestão → Pessoas**, cadastre quem vai avaliar e envie para cada pessoa o e-mail e a senha provisória.
3. Envie o link.

## Publicação do branch de desenvolvimento
O app está no branch `claude/controle-interacao-visual-identity-uqm36x`. Para a Vercel publicar esse branch como principal:
**Settings → Git → Production Branch** → informe o nome do branch → **Redeploy**.
(Ou faça o *merge* para o branch principal do repositório.)
