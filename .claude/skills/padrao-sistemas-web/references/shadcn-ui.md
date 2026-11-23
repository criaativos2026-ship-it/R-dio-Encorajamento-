# shadcn/ui no padrão do usuário

## Instalação

1. `components.json` (style `new-york`, `rsc: true`, `cssVariables: true`, `iconLibrary: "lucide"`, aliases `@/components`, `@/lib/utils`, `@/components/ui`) e `src/lib/utils.ts` com `cn()` (clsx + tailwind-merge).
2. Preferir o instalador oficial: `npx shadcn@latest add button input textarea label checkbox card badge progress avatar separator collapsible alert-dialog dropdown-menu sonner`.
3. **Se `ui.shadcn.com` estiver bloqueado** (ambientes com rede restrita): peça para liberar o domínio; se o usuário não conseguir aprovar (ex.: no celular), escreva os componentes no padrão new-york usando o pacote `radix-ui` (importe `{ Slot, Checkbox, Progress, … } from "radix-ui"`, `data-slot` em cada parte) e, depois, com acesso, compare com `npx shadcn@latest diff`.

## Tema

- As variáveis do shadcn (`--primary`, `--muted`, `--border`, `--ring`, `--radius`…) apontam para os tokens do projeto (veja `stack-e-estrutura.md`). Nenhuma cor nova dentro dos componentes.
- **Variantes da marca ficam no próprio componente** (como o shadcn recomenda), ex. no `buttonVariants`: `brandOutline`, `ink` (escuro), `outlineLight` (sobre fundo escuro). Na `badge`: `brand`.

## Componentes do app (montados sobre o shadcn)

- `Panel` / `PanelHeader` sobre `Card` (`CardHeader`, `CardTitle`, `CardDescription` como rótulo pequeno, `CardAction`).
- `Field` (Label + campo + dica), `FormError` (erro junto ao formulário) e `useFormFeedback(state)` (toast de sucesso + limpar formulário).
- `SubmitButton` com `useFormStatus` (texto "Salvando…", desabilitado enquanto envia).
- `ConfirmButton`: botão que abre `AlertDialog` com título, explicação das consequências, "Cancelar" e ação; mostra toast de sucesso/erro. **Toda ação destrutiva ou irreversível usa isso.**
- `NativeSelect` (select nativo estilizado) em vez de Select do Radix em formulários — no celular abre o seletor do sistema. Aceita `wrapperClassName` para largura.
- Menu da conta: `DropdownMenu` + `Avatar` (nome, e-mail, perfil, Meu perfil, Gestão, Privacidade, Sair).
- Detalhes recolhíveis (ex.: "Marcar como resolvido" com observação): `Collapsible`.
- `Toaster` (Sonner) no layout raiz, `position="top-center"`.

## Armadilhas já vistas

- `Button` com `asChild` + `<Link>` para navegação (não aninhar `<a>` em `<button>`).
- Classe `hidden` junto com `inline-flex` do botão se anulam: para esconder em telas pequenas, envolva em `<div className="hidden lg:block">`.
- Com `DropdownMenu` aberto, o gatilho fica `aria-hidden` (em testes, selecione o conteúdo do menu).
- `Checkbox` do Radix dentro de `<form>` com `name`/`value="on"` envia o valor normalmente; fora de formulário use `checked`/`onCheckedChange`.
- `Progress`: passe `aria-label`; para "concluído" troque a cor do indicador quando chegar a 100% (a cor de concluído vem dos tokens do projeto).
