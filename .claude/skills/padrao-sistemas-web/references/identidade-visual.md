# Identidade visual: método (sem valores fixos)

Cada sistema tem a sua cara. **Não reutilize cores, fontes, logos ou vídeos de projetos anteriores.** O que se repete é o método abaixo.

## 1. Extrair do site de referência (não "achar" pela aparência)

1. Baixe o HTML (`curl -sSL -D headers.txt`) e veja: título, meta, `<link rel=stylesheet>`, fontes, imagens da logo, `X-Powered-By`/caminhos (`/_next/` = Next.js).
2. Baixe os CSS e procure:
   - variáveis próprias (`grep -oE -- '--[a-z0-9-]+:[^;}]+'`), em especial as do padrão shadcn (`--primary`, `--muted`, `--radius`) e as da marca;
   - em qual seletor estão (`:root`, `.dark`, alto contraste);
   - `@font-face` e a classe da fonte (`next/font` gera `__className_…`).
3. Abra o site no navegador (Playwright) e **meça** estilos computados: botões (cor, raio, padding, peso, maiúsculas, espaçamento), títulos (tamanho, peso, `letter-spacing`), rótulos, campos, cartões; contagem de raios usados (`border-radius`) para descobrir a escala.
4. Logos: baixe os **arquivos originais** (SVG/PNG), verifique que não têm script (`grep -i '<script\|on[a-z]*='`), renderize para ver as versões (clara/escura) e use sem alterar, sempre com largura proporcional.
5. Cores em `oklch` → HEX com `scripts/oklch_to_hex.py` (cálculo exato, sem estimar).
6. Se o site não puder ser lido (rede bloqueada), **peça acesso**; se negado, use uma base **neutra** marcada como `PROVISÓRIO` e um espaço reservado para a logo — nunca invente uma identidade.

## 2. Documento de validação (antes de implementar)

`docs/VALIDACAO-IDENTIDADE-E-STACK.md` com: análise da linguagem visual; paleta (papel, HEX, variável de origem); tipografia; bordas/espaçamento; tecnologias do site e evidências; stack recomendada; e a **proposta visual da tela inicial** (`docs/proposta/tela-inicial.html` usando `design/tokens.css`, com capturas no celular e no computador). Pergunte ao usuário sobre estados (ex.: cor de "concluído") mostrando **as opções lado a lado** numa imagem.

## 3. Aplicação

- Reproduza padrões do site (ex.: faixa escura no topo, rótulos com traço, grade numerada, botão contornado no cabeçalho) e explique na proposta de onde veio cada um.
- Não mostre estado que o app não conhece (ex.: "ao vivo") — troque por algo verdadeiro (ex.: link "Ouvir").

## 4. Vídeo de fundo (quando o site oficial tem)

Quando o usuário mandar gravações de tela (ex.: do YouTube) para usar como fundo:
1. `ffprobe` (duração, resolução) e uma folha de quadros (`fps=1,tile`) para ver o conteúdo.
2. Recorte só a área do vídeo (meça as colunas da borda lendo pixels; deixe margem de ~10 px para tirar faixas coloridas), corte a faixa de **legendas** do YouTube, remova **áudio**.
3. **Remova a tela do player** (título, pausa, barra de progresso) e telas pretas do começo/fim — elas reaparecem a cada repetição.
4. Gravações seguidas se **sobrepõem**: rode `scripts/achar_sobreposicao_videos.py` para achar onde cada uma começa dentro da anterior e corte nesses pontos; depois varra o resultado procurando repetições.
5. Respeite a ordem pedida pelo usuário (se ele disser "sequência completa", não escolha trechos).
6. Gere duas versões H.264 (`-crf 30`, `-movflags +faststart`, 24 fps): ~1280 px para computador e ~854 px para celular, mais uma imagem de capa (poster).
7. Componente cliente `HeroVideo`: `<video autoPlay muted loop playsInline preload="metadata" poster>` com `<source media="(max-width: 767px)">` para a versão leve; no `useEffect`, `video.muted = true` (o React não grava o atributo e o iPhone não inicia sem ele) e `play()`; pausa se `prefers-reduced-motion`. Camadas de gradiente escuro por cima para legibilidade; confira capturas em vários momentos do vídeo (cenas claras e escuras).
8. Avise: no iPhone em Modo de Pouca Energia o sistema bloqueia autoplay e mostra um play — dá para esconder e manter só a capa.
