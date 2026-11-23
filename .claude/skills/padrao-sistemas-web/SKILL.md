---
name: padrao-sistemas-web
description: Padrão do usuário para criar sistemas e aplicativos web (painéis, ferramentas internas, apps de equipe, sistemas para igrejas, empresas e organizações) com Next.js (App Router) + React + TypeScript + shadcn/ui + Tailwind CSS v4, PostgreSQL + Drizzle, Auth.js, Zod, LGPD completa, publicação na Netlify e testes E2E com Playwright. Use SEMPRE que o usuário pedir para criar, iniciar, planejar, publicar ou evoluir um sistema, site com login, app web, painel, ferramenta de equipe, cadastro, checklist ou qualquer aplicação com banco de dados — mesmo que ele não cite a stack — e também quando pedir LGPD/privacidade, perfis de acesso, deploy na Netlify ou identidade visual a partir de um site de referência.
---

# Padrão de sistemas web

Este é o jeito de trabalhar que o usuário aprovou num projeto real (um app de equipe de serviço de uma igreja) e quer repetir em **todos os próximos sistemas**. Cada sistema terá **identidade visual própria**: nada de cores, fontes ou logos de projetos anteriores. O que se repete é a **stack**, o **processo**, a **segurança**, a **LGPD** e a **qualidade**.

## Como falar com o usuário

- Português do Brasil, linguagem simples. O usuário não é programador e muitas vezes usa o celular: evite jargão ou explique em uma frase.
- Ele valoriza ver o resultado: mande **imagens das telas**, com **uma informação por imagem** (um cartão, um formulário, uma seção), no tamanho da tela do celular. Nunca capturas de página inteira gigantes. Veja `references/testes-e-qualidade.md`.
- Seja honesto sobre limites (rede bloqueada, algo não testado) e diga exatamente o que ele precisa fazer, passo a passo, com os nomes dos botões.
- Aprovações de ambiente pelo celular podem falhar: ofereça sempre um caminho que ele consiga fazer pelo celular (ex.: ligar o repositório na Netlify pela interface).

## Stack obrigatória

| Camada | Escolha |
|---|---|
| Framework | **Next.js (App Router, versão estável mais recente) + React + TypeScript** |
| Componentes | **shadcn/ui** (Radix) — estilo new-york, variantes da marca dentro dos próprios componentes |
| Estilo | **Tailwind CSS v4** ligado a **design tokens** num arquivo único (`design/tokens.css`) |
| Ícones | **lucide-react** |
| Banco | **PostgreSQL + Drizzle ORM** (migrações versionadas) |
| Login | **Auth.js** (credenciais, bcrypt, sessão JWT conferida no banco a cada requisição) |
| Validação | **Zod** em toda entrada do servidor |
| Avisos | **Sonner** (toasts) e **Alert Dialog** para confirmações (nunca `confirm()` do navegador) |
| Publicação | **Netlify** + **Netlify Database** |
| Testes | **Playwright** (fluxo completo no navegador, celular e computador) |

Detalhes de estrutura, configuração e armadilhas: `references/stack-e-estrutura.md`.

## Processo de trabalho (siga nesta ordem)

1. **Entender a referência.** Se houver um site ou marca de referência, extraia a identidade **do código do site** (variáveis CSS, fontes, SVG da logo, raios de borda medidos). Não invente cores; o que não der para confirmar é marcado como provisório. Método: `references/identidade-visual.md`.
2. **Etapa de validação antes de implementar.** Apresente: análise da identidade, paleta com HEX, tipografia, tecnologias encontradas, stack recomendada e **uma proposta visual da tela inicial** (página HTML estática com os tokens). Espere a aprovação.
3. **Implementar** com a stack acima, em camadas: tokens → componentes shadcn → telas → ações do servidor → permissões → LGPD.
4. **Testar de verdade**: build de produção + teste E2E cobrindo cada fluxo e cada permissão. Corrija o que o teste revelar (inclusive problemas visuais vistos nas capturas).
5. **Publicar** na Netlify (`references/deploy-netlify.md`) e dizer ao usuário o que conferir no link.
6. **Commits pequenos e descritivos** em português, um por entrega.

## Regras de produto que o usuário espera

- **Perfis de acesso**: separar quem **usa no dia a dia** de quem **gerencia** (ex.: Gestão = vários perfis com as mesmas permissões e nomes diferentes; Usuário/Voluntário). Sempre manter ao menos uma pessoa ativa na gestão. Verifique a permissão **no servidor**, em toda ação, nunca só escondendo botões. `references/autenticacao-e-permissoes.md`.
- **Sem cadastro aberto**: a gestão cria as contas. O primeiro acesso (`/configurar`) só existe enquanto não houver usuários.
- **Horários sempre do servidor** (fuso do cliente, ex.: `America/Sao_Paulo`), nunca digitados pelo usuário nem tirados do relógio do aparelho — o usuário quer que ninguém consiga alterar horários.
- **Tudo registrado**: cada ação importante gera uma linha no histórico (quem, o quê, quando).
- **Regras de sequência** (ex.: uma etapa só libera quando a anterior termina) valem no servidor **e** na tela, com aviso claro do que falta.
- **Relatórios** para a gestão, com opção de imprimir/PDF.
- **Celular primeiro**: barra de abas inferior no celular, menu no topo no computador, alvos de toque grandes.
- **Acessibilidade**: foco visível, rótulos, `aria-*`, contraste; vídeo de fundo respeita "reduzir movimento".

## LGPD (obrigatória em todo sistema com dados pessoais)

Implemente desde o início, sem esperar pedido: aviso de privacidade público, aceite obrigatório versionado, baixar meus dados, corrigir dados (inclusive e-mail), pedir exclusão, exclusão por anonimização feita pela gestão, limpeza automática por prazo e configuração centralizada (contato do responsável e prazo marcados como PENDENTE até o cliente informar). Avalie se há **dado sensível** (religião, saúde, etc.) — se houver, a base legal costuma ser consentimento. Passo a passo e textos-modelo: `references/lgpd.md`.

## Segurança mínima

Senhas com bcrypt; limite de tentativas de login; sessão conferida no banco a cada requisição (conta desativada perde acesso na hora); Zod em toda entrada; cabeçalhos de segurança no `next.config.ts`; `robots: noindex` em sistemas internos; segredos só em variáveis de ambiente (nunca no Git); `.env*.local` no `.gitignore`; ao publicar arquivos, copie de uma cópia limpa do repositório.

## Referências (leia quando o assunto aparecer)

| Arquivo | Quando ler |
|---|---|
| `references/stack-e-estrutura.md` | Ao criar o projeto, configurar Next/Tailwind/shadcn/Drizzle ou organizar pastas |
| `references/autenticacao-e-permissoes.md` | Login, perfis, ações do servidor, histórico |
| `references/shadcn-ui.md` | Componentes, tema, formulários, confirmações, toasts |
| `references/lgpd.md` | Privacidade, aviso, direitos do titular, anonimização, retenção |
| `references/deploy-netlify.md` | Publicar, banco na Netlify, variáveis, acesso de visitantes |
| `references/identidade-visual.md` | Extrair identidade de um site, proposta visual, vídeo de fundo |
| `references/testes-e-qualidade.md` | Testes E2E, capturas de tela para o usuário, armadilhas |

Scripts prontos em `scripts/`: `oklch_to_hex.py` (converter cores oklch do site para HEX) e `achar_sobreposicao_videos.py` (achar trechos repetidos entre gravações de tela antes de juntar vídeos).
