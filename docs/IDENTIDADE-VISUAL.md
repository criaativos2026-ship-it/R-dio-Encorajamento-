# Identidade visual — Controle Interação · Rádio Encorajamento

## Status: PROVISÓRIO

A referência oficial é o site **https://www.missaoencorajamento.com.br/**.
Ele **não pôde ser lido** no ambiente onde o app foi desenvolvido (acesso de rede bloqueado), e uma busca na web não trouxe informações sobre a identidade da Missão Encorajamento.

Por isso, **nenhuma cor, fonte ou logo deste app é oficial**. Nada foi inventado como se fosse da igreja. A interface usa uma base neutra e sóbria, para que a identidade real seja aplicada depois sem retrabalho.

## O que está pendente

| Item | Situação atual | Onde trocar |
|---|---|---|
| Cor principal (HEX) | `#1F3A5F`: azul-marinho neutro, **provisório** | `css/tokens.css` → `--brand-primary` |
| Variação escura da principal | `#142840`, **provisório** | `--brand-primary-strong` |
| Fundo suave da principal | `#E7EDF5`, **provisório** | `--brand-primary-soft` |
| Cor de destaque | `#C9A227`, **provisório** | `--brand-accent` |
| Texto sobre a cor principal | `#FFFFFF` | `--brand-on-primary` |
| Fonte de títulos | Fonte do sistema, **provisória** | `--font-display` |
| Fonte de texto | Fonte do sistema, **provisória** | `--font-body` |
| Logo | Espaço reservado "Logo oficial" | `assets/logo/logo.svg` (veja `assets/logo/README.md`) |

As cores de estado (verde = concluído, âmbar = atenção, vermelho = crítico) são funcionais e não fazem parte da marca.

## O que é preciso enviar

1. O arquivo da logo, de preferência em SVG ou PNG com fundo transparente. Se existirem versões para fundo claro e escuro, envie as duas.
2. Os códigos HEX das cores institucionais, ou um manual de marca.
3. O nome da(s) fonte(s) institucional(is) e os pesos usados.
4. Uma alternativa: liberar o acesso ao site no ambiente de desenvolvimento, para que tudo seja extraído direto do código do site.

Quando os itens chegarem, basta atualizar `css/tokens.css` e o arquivo da logo. Todas as telas herdam os novos valores automaticamente. Depois disso, remova o selo "Identidade visual provisória" em `index.html`.

## Princípios já aplicados

- **Organização:** hierarquia clara, com título, subtítulo e ação em cada tela. O progresso é sempre visível.
- **Simplicidade:** uma única cor de marca nas ações principais. Os neutros cuidam da estrutura.
- **Responsabilidade:** cada etapa concluída, problema e comunicado registra quem fez e quando.
- **Unidade:** o mesmo painel, os mesmos checklists e o mesmo mural para toda a equipe.
- **Modernidade:** cartões leves, cantos suaves, indicadores circulares e layout responsivo (computador e celular).
- Nenhum elemento religioso genérico decorativo. A identidade vem só da marca da Missão Encorajamento.
