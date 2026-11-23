/**
 * Configuração de privacidade (LGPD) — tudo o que o aviso de privacidade e as rotinas usam.
 *
 * ⚠ PENDENTE: preencher CONTATO_PRIVACIDADE e confirmar RETENCAO_DIAS com a igreja.
 * Ao mudar o texto do aviso de forma relevante, aumente AVISO_VERSAO: todos precisarão aceitar de novo.
 */

/** Versão do aviso de privacidade. Mudou → todos aceitam novamente no próximo acesso. */
export const AVISO_VERSAO = "2026-11";
export const AVISO_DATA = "23 de novembro de 2026";

/** Controladora dos dados (LGPD, art. 5º, VI). */
export const CONTROLADOR = "Igreja Missão Encorajamento";
export const CONTROLADOR_LOCAL = "São Carlos — SP";

/** Canal para pedidos dos titulares (art. 18 e art. 41). PENDENTE: definir com a igreja. */
export const CONTATO_PRIVACIDADE: { responsavel: string | null; email: string | null } = {
  responsavel: null,
  email: null,
};

/**
 * Por quanto tempo o histórico e os registros dos cultos ficam guardados (dias).
 * PENDENTE: confirmar com a igreja. Provisório: 2 anos.
 */
export const RETENCAO_DIAS = 730;

export const RETENCAO_TEXTO = (() => {
  const anos = RETENCAO_DIAS / 365;
  return Number.isInteger(anos) ? `${anos} ${anos === 1 ? "ano" : "anos"}` : `${RETENCAO_DIAS} dias`;
})();

/** Nome exibido no lugar de uma pessoa cujos dados foram excluídos (anonimizados). */
export const NOME_ANONIMO = "Pessoa removida";
