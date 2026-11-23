# LGPD — implementação padrão

Faça desde a primeira versão de qualquer sistema com dados pessoais. Explique ao usuário que é uma implementação técnica e que o texto deve passar por revisão jurídica antes do lançamento.

## 0. Análise inicial (apresente ao usuário)

- **Minimização**: colete só o necessário (nome, e-mail, perfil). Evite CPF, telefone, endereço, foto, nascimento e localização, a menos que sejam indispensáveis.
- **Dado sensível** (art. 5º, II): religião, saúde, orientação sexual, biometria, etc. Atenção: participar da equipe de uma igreja pode revelar convicção religiosa. Com dado sensível, a base legal costuma ser **consentimento** (art. 7º, I e art. 11, I).
- **Transferência internacional** (art. 33): Netlify/Vercel/AWS ficam fora do Brasil — declare no aviso e recomende aceitar o DPA do fornecedor.
- **Controlador** = a organização cliente. Organizações pequenas/sem fins lucrativos podem ser **agente de pequeno porte** (Resolução CD/ANPD nº 2/2022): encarregado (DPO) pode ser dispensado, mas o **canal de contato** é obrigatório.
- **Campos de texto livre** podem receber dados de terceiros: oriente a equipe.

## 1. Configuração central — `src/lib/privacidade.ts`

```ts
export const AVISO_VERSAO = "AAAA-MM";            // mudou de forma relevante → todos aceitam de novo
export const AVISO_DATA = "dd de mês de aaaa";
export const CONTROLADOR = "Nome da organização";
export const CONTROLADOR_LOCAL = "Cidade — UF";
export const CONTATO_PRIVACIDADE = { responsavel: null as string | null, email: null as string | null }; // PENDENTE
export const RETENCAO_DIAS = 730;                  // PENDENTE: confirmar com o cliente
export const NOME_ANONIMO = "Pessoa removida";
```
Enquanto o contato for `null`, o aviso mostra "Canal de contato em definição… fale com a gestão". Peça ao cliente: **responsável + e-mail** e **prazo de guarda**.

## 2. Banco

Colunas em `users`: `privacy_accepted_at`, `privacy_version`, `deletion_requested_at`, `anonymized_at`. Tipo de atividade `privacidade` no enum do histórico.

## 3. Aviso de privacidade (`/privacidade`, público)

Componente `AvisoPrivacidade` reutilizado na página pública e na tela de aceite. Seções numeradas, linguagem simples:
1. Quem cuida dos seus dados (controlador + contato)
2. Quais dados o app guarda (cadastro; senha só criptografada; registros de uso com data/hora; aceite) e o que **não** coleta
3. Para que usamos (e que não vende/compartilha/usa para propaganda)
4. Base legal (por que pedimos consentimento, se houver dado sensível)
5. Quem pode ver (toda a equipe × só a gestão)
6. Onde os dados ficam (fornecedor e país — transferência internacional)
7. Por quanto tempo (prazo automático; cadastro enquanto fizer parte)
8. Seus direitos (art. 18) e **onde clicar no app** para cada um; ANPD
9. Segurança e cookies (só o cookie de sessão — dispensa banner de cookies) e compromisso de comunicar incidentes
10. Mudanças no aviso (nova versão exige novo aceite) + versão e data

Links para o aviso: tela de login, menu da conta, Perfil.

## 4. Aceite obrigatório (`/aceite`)

- `requireUser()` redireciona para `/aceite` se `privacyVersion !== AVISO_VERSAO` → nenhuma tela **nem ação** funciona sem aceite.
- Página mostra o aviso em caixa com rolagem, caixa "Li e concordo", botão "Concordo e quero continuar" e "Não concordo, sair do app".
- Ação `acceptPrivacy`: exige a caixa marcada; grava data (servidor) e versão; registra no histórico.
- Texto diferente quando é uma **nova versão** ("O aviso foi atualizado…").

## 5. Direitos do titular (Perfil → "Meus dados e privacidade")

- Mostrar quando e qual versão foi aceita.
- **Baixar meus dados**: rota `GET /api/meus-dados` (exige login) que devolve JSON com perfil, participações, marcações, problemas, comunicados e histórico da pessoa, **sem senha/hash**, com `Content-Disposition: attachment` e `Cache-Control: no-store`; registra no histórico.
- **Corrigir dados**: nome/função no perfil; **troca de e-mail** confirmada pela senha atual e checando duplicidade.
- **Pedir exclusão** (com `ConfirmButton`) e **cancelar pedido**.

## 6. Exclusão por anonimização (Gestão → Pessoas)

- Selo "Pediu exclusão" e aviso no topo da lista com a quantidade de pedidos.
- Botão **Excluir dados** (ConfirmButton explicando que é irreversível). Ação `anonymizeUser` em transação:
  - `name = NOME_ANONIMO`, `email = removido-<id>@anonimo.invalid`, senha aleatória, função `null`, perfil de menor acesso, `active = false`, limpa aceite e pedido, `anonymizedAt = now`;
  - troca o nome antigo por `NOME_ANONIMO` (SQL `replace`) em histórico, problemas e comunicados;
  - mantém os registros operacionais (relatórios continuam corretos sem identificar ninguém);
  - impede excluir a si mesmo e esvaziar a gestão;
  - registra no histórico **sem citar o nome**.
- Pessoas anonimizadas saem da lista de Pessoas.

## 7. Limpeza automática por prazo — `src/lib/retencao.ts`

`purgeExpiredData()` apaga o que passou de `RETENCAO_DIAS`: ciclos encerrados (com dados ligados por cascade), histórico, itens resolvidos, comunicados não fixados. Chamada no layout da Gestão com trava de no máximo uma execução a cada 6 h por servidor (ou numa função agendada da hospedagem).

## 8. Testes que devem existir

Primeiro acesso pede aceite; sem aceite não acessa nada; aceite exige caixa; aceite gravado com versão; exportação tem o e-mail, vem como anexo e **não** contém senha/hash; exportação exige login; troca de e-mail; pedido de exclusão aparece para a gestão; anonimização some com nome/e-mail do banco e do histórico e a pessoa não entra mais; aviso público acessível sem login; limpeza apaga registros mais antigos que o prazo.

## 9. Fora do app (lembrar o cliente)

Aceitar o DPA do fornecedor de hospedagem; revisão jurídica do aviso; definir canal de contato; deixar o repositório **privado** se for app interno.
