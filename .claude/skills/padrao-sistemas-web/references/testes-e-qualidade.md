# Testes e qualidade

## Ciclo antes de cada entrega

`tsc --noEmit` → `eslint .` → `next build` (confira rotas `○`/`ƒ`) → subir `next start` numa porta → teste E2E com Playwright → capturas → commit/push.

## Teste E2E (Playwright, um script em Node)

- Banco de teste limpo a cada rodada (`TRUNCATE ... CASCADE` das tabelas de dados, preservando as de configuração).
- Cubra **cada fluxo e cada permissão**: primeiro acesso; aceite LGPD; criar/abrir; marcar/desmarcar e persistir após recarregar; regras de sequência (bloqueado → liberado); problemas; comunicados; cadastro (inclusive e-mail duplicado com maiúsculas); não esvaziar a gestão; diálogo de confirmação; relatórios; login errado (e-mail mantido); usuário comum sem acesso à gestão e sem formulários de gestão; menu da conta; conta desativada perde acesso; anônimo vai para o login; `/configurar` bloqueada após o primeiro cadastro; direitos LGPD.
- Contextos: computador (1280×860) e celular (`devices['iPhone 13']`).
- Imprima `PASS/FAIL` por cenário e os erros de JavaScript da página (`pageerror`); o resultado esperado é zero falhas e `JS errors: []`.
- Para conferir o banco no teste, use `execFileSync('psql', [...args])` com `PGPASSWORD` (evita problemas de aspas).

## Armadilhas já resolvidas

- **Servidor antigo rodando** serve arquivos de um build substituído ("This page couldn't load"): encerre com `pkill -f next-server` (o processo não se chama "next start").
- Navegação por `Link`/ação muda a URL **sem evento load**: use `waitForURL(url, { waitUntil: 'commit' })` e espere um elemento da página.
- **Textos duplicados** (menu escondido no celular + visível): use `locator(sel).locator('visible=true').first()` ou `getByRole('button', { name })`.
- **Barra fixa (`sticky`) dentro de cartão com `overflow-hidden`** se posiciona em relação ao cartão e cobre itens: não use `overflow-hidden` no pai de elementos `sticky`.
- Itens que rolam para baixo de barras fixas: `scroll-mt-*`/`scroll-mb-*`.
- `PostgreSQL` local pode parar quando o ambiente reinicia: `service postgresql start`.
- Animações de diálogos/menus: espere ~500 ms antes de capturar (senão sai semitransparente).

## Capturas para o usuário (como ele gosta)

- **Uma informação por imagem**: recorte cada cartão/formulário/seção (união das caixas dos elementos + margem), no tamanho de tela do celular.
- Seção maior que uma tela → várias imagens "parte 1 de N", **cortando entre itens** (no fim de uma linha/grupo), nunca no meio de um texto.
- Antes de recortar, deixe cabeçalho/barras fixas estáticos (`position: static`) e esconda toasts, para não aparecerem no meio.
- Dados de demonstração realistas e **fictícios** (script de seed separado, fora do app), com horários coerentes.
- Envie em grupos por área do app, com legenda curta; avise se alguma imagem foi reduzida.

## Commits

Mensagens em português, título curto no imperativo + lista do que mudou e por quê. Nunca commitar `.env*.local`, `node_modules`, `.next`, `.netlify`.
