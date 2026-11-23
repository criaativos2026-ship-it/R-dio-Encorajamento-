# Validação: identidade visual e tecnologia

**Projeto:** Controle Interação · Rádio Encorajamento
**Referência:** https://www.missaoencorajamento.com.br/ (analisado em 23/11/2026)
**Método:** leitura do HTML e do CSS de produção do site (`/_next/static/css/436e6a94bcad784a.css`), estilos medidos no navegador e logos baixadas do próprio site. Nenhum valor desta página foi estimado por aparência.

---

## 1. Análise da identidade visual

O site trabalha com **três elementos**: preto-grafite, branco e um laranja vibrante. A linguagem é editorial e confiante:

- **Títulos enormes** em Inter peso 900, com espaçamento negativo entre letras. Muitas vezes uma palavra-chave vem em laranja: "Bem-vindos à Igreja Missão **Encorajamento.**", "Igreja **Viva**".
- **Rótulos** ("FIQUE POR DENTRO", "NOSSAS GERAÇÕES") em maiúsculas, com espaçamento largo (0,3em). Muitas vezes são precedidos por um traço laranja fino.
- **Números em fonte monoespaçada** ("01", "02"…) para numerar cartões.
- **Grades com bordas finas** (1px, preto a 8–15% de opacidade) e cantos arredondados de cerca de 13px.
- **Blocos sólidos em laranja** para a mensagem principal da seção, como o card "Você foi encorajado…" e a faixa da newsletter.
- **Faixas escuras** (#0E0E0D) no topo e na seção do app, alternando com fundos #FFFFFF e #F5F5F5.
- **Botões:** laranja preenchido com texto branco, contornado laranja ("Contribuir") ou pílula. Os botões de ação secundária usam maiúsculas com espaçamento.
- **Ícones** de uma única biblioteca, Lucide, com traço de 2px e cantos arredondados.
- **Tema escuro e modo de alto contraste** existem no CSS do site.
- O próprio site já tem um link "**Rádio Encorajamento** ao vivo", com ícone de rádio, que leva a radioencorajamento.com.br.

### Logo
O site traz duas versões em SVG, na proporção 1181 × 373, exibidas com 190 × 57 e largura automática:

| Arquivo | Uso no site | Cores |
|---|---|---|
| `logo-black.svg` | Fundo claro (cabeçalho ao rolar, rodapé) | Preto (sem `fill` definido, então sai em preto puro) |
| `logo-white.svg` | Fundo escuro (topo da página) | Branco + leão em `rgb(255,92,53)` = **#FF5C35** |
| `icon.png` (300 × 300) | Favicon / ícone do app | Leão em laranja |

Os três arquivos foram copiados sem alteração para `assets/logo/`.

---

## 2. Paleta de cores (HEX)

Todas as cores vêm das variáveis `--sc-*` do site, valores literais do CSS.

| Papel | HEX | Variável no site |
|---|---|---|
| **Cor predominante da marca** | **#FF5C35** | `--sc-brand` (também a cor do leão na logo) |
| Hover da marca | #E04D2A | `--sc-brand-hover` |
| Laranja para texto em fundo claro | #C94820 | `--sc-brand-text` |
| Laranja claro (2ª cor de degradê em títulos) | #FF8A5C | `--mj-lime` |
| Texto / títulos | #1D1D1B | `--sc-text` |
| Fundo | #FFFFFF | `--sc-bg` |
| Fundo alternativo | #F5F5F5 | `--sc-bg-alt` |
| Bordas | #1D1D1B14 (8%) · #1D1D1B26 (15%) | `--sc-border`, `--sc-border-15` |
| Texto secundário | #1D1D1B80 · #1D1D1B59 · #1D1D1B40 | `--sc-text-50/35/25` |
| Fundo escuro (faixas, tema escuro) | #0E0E0D | `--sc-bg` em `.dark` |
| Fundo alternativo escuro | #161615 | `--sc-bg-alt` em `.dark` |
| Superfície escura | #1D1D1B | `--sc-surface` em `.dark` |

As cores abaixo estão em `oklch` no site (padrão shadcn/ui) e foram convertidas para HEX por cálculo:

| Variável | oklch no site | HEX |
|---|---|---|
| `--primary` | oklch(55.3% .195 38.402) | #CA3500 |
| `--muted-foreground` | oklch(45% 0 0) | #555555 |
| `--border` | oklch(90% 0 0) | #DEDEDE |
| `--destructive` | oklch(57.7% .245 27.325) | #E7000B |

**Cor que não é do site:** o app precisa de um verde para "concluído/resolvido" (#1E8E5A). O site não tem uma cor equivalente. Ela está separada da paleta institucional (prefixo `--app-`) e é usada só como indicador de estado. Se preferir, posso usar apenas o laranja e o preto também para esses estados.

---

## 3. Tipografia

| Item | Valor encontrado |
|---|---|
| Família principal | **Inter** (carregada pelo `next/font`, pesos 100–900, fallback Arial ajustado) |
| Títulos | Inter **900**. Ex.: H2 72px com espaçamento −1,8px; H3 25,6px com −0,64px |
| Texto | Inter 400–600, 14–16px |
| Rótulos | 12–14px, peso 600–900, maiúsculas, espaçamento 0,3em (4,2px em 14px) |
| Números/rótulos técnicos | Monoespaçada do sistema (`ui-monospace, SFMono-Regular, Menlo…`) |

## Bordas e espaçamento

- Raio base do site: `--radius: .45rem`. A escala usada é ×0,6 (etiquetas, 4,32px), ×0,8 (links, 5,76px), ×1,4 (10,08px) e ×1,8 (botões, campos e cartões, **12,96px**). Cartões com imagem usam 32px; botões-pílula, raio total.
- Os campos de formulário têm 52px de altura.
- Espaçamento: escala Tailwind, com base de 4px.

Tudo isso está centralizado em **`design/tokens.css`**, com a origem de cada valor anotada.

---

## 4. Tecnologias encontradas no site

| Camada | Encontrado | Evidência |
|---|---|---|
| Framework | **Next.js** (App Router, páginas pré-renderizadas) | cabeçalhos `X-Powered-By: Next.js` e `X-Nextjs-Prerender`, pastas `/_next/static/chunks/app/…` |
| Linguagem | **JavaScript/TypeScript** com **React** | Next.js é React. Não dá para afirmar se o código-fonte é TS ou JS, porque o pacote publicado é JS compilado |
| Estilização | **Tailwind CSS v4** | classes como `h-8 w-auto sm:h-12 dark:hidden`, variáveis `--color-*` em `oklch`, `--spacing` |
| Componentes | Tokens no padrão **shadcn/ui** | variáveis `--primary`, `--sidebar-*`, `--chart-1…5`, `--radius` |
| Ícones | **Lucide** | 37 ícones `class="lucide …"` |
| Fonte | Inter pelo `next/font` | `@font-face` autohospedada em `/_next/static/media/` |
| Animação | Provável biblioteca **Motion** (Framer Motion) | referências a "motion" no HTML. Não confirmado |
| Servidor | Proxy **OpenResty** (nginx) | cabeçalho `Server: openresty` |

**O que não dá para saber pelo site público:** o backend (banco de dados, autenticação, APIs internas) e a hospedagem real. Eles não aparecem no código entregue ao navegador.

---

## 5. Stack recomendada para o aplicativo

A mesma base do site, mais um backend seguro:

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** | Mesma tecnologia do site. Frontend e backend no mesmo projeto, com separação clara (Server Actions/Route Handlers) |
| Estilo | **Tailwind CSS v4** com os tokens de `design/tokens.css` | Mesmo sistema do site, sem CSS solto pelas telas |
| Componentes | **shadcn/ui** (Radix) personalizados com os tokens | Mesmo padrão do site e acessível |
| Ícones | **lucide-react** | Mesma biblioteca do site |
| Fonte | Inter pelo `next/font` | Idêntico ao site |
| Banco de dados | **PostgreSQL** + **Drizzle ORM** | Dados estruturados: voluntários, cultos, checklists, problemas, comunicados, histórico |
| Autenticação | **Auth.js** (login com e-mail/senha ou link mágico) e perfis (voluntário, coordenação) | Cada ação fica registrada com o autor de forma confiável |
| Validação | **Zod** | Entradas validadas no servidor |
| Celular | **PWA** (instalável na tela inicial) | Uso no celular durante o culto, sem loja de apps |

A hospedagem depende de onde o site está hoje, e isso eu não consegui identificar. Funcionam bem a Vercel com Postgres gerenciado (Neon/Supabase) ou o mesmo servidor do site, com Docker e Postgres.

---

## 6. Proposta visual da tela inicial

Arquivos:
- `docs/proposta/tela-inicial.html` (abre no navegador)
- `docs/proposta/tela-inicial-desktop.png`
- `docs/proposta/tela-inicial-mobile.png`

A proposta reproduz os padrões do site:
- Cabeçalho branco com a logo preta, menu e botão contornado laranja (como "Contribuir").
- Faixa escura com rótulo e traço laranja, e o título em 900 com o nome em laranja (como "Bem-vindos à… **Encorajamento.**").
- Grade de 4 cartões com bordas finas e números monoespaçados, com o último em laranja sólido (como o bloco das "Identidades").
- Etiquetas em maiúsculas para categorias, listas com ícones Lucide e barra de abas no celular.

---

## Próximo passo

Depois que você aprovar paleta, tipografia, stack e proposta, a implementação começa em Next.js. O protótipo estático anterior (`index.html`, `css/`, `js/`) será substituído.
