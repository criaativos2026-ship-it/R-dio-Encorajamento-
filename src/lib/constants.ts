/** Funções de serviço da equipe (definidas pela igreja). */
export const FUNCOES = ["Diretor de Transmissão", "Operador da Rádio"] as const;

export const CHECKLIST_LABEL = { montagem: "Montagem", desmontagem: "Desmontagem" } as const;

export const SEVERIDADE = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
} as const;

export const TIMEZONE = "America/Sao_Paulo";

/** Aviso exibido no topo de cada checklist (definido pela equipe). */
export const CHECKLIST_AVISO: Partial<Record<"montagem" | "desmontagem", string>> = {
  desmontagem:
    "Deixar o ambiente limpo e organizado, colocar tudo que foi tirado do lugar de volta no lugar. Atenção aos equipamentos que ficam guardados no hall entre a rádio e o streaming, não deixar mais equipamentos do que o espaço comporta.",
};

/** Perfis de acesso. Pastor(a), líder e coordenação formam a "gestão" (acompanham e alteram o app). */
export const PERFIS = ["pastor", "lider", "coordenacao", "voluntario"] as const;
export type Perfil = (typeof PERFIS)[number];
export const PERFIS_GESTAO: readonly Perfil[] = ["pastor", "lider", "coordenacao"];
export const PERFIL_LABEL: Record<Perfil, string> = {
  pastor: "Pastor(a)",
  lider: "Líder",
  coordenacao: "Coordenação",
  voluntario: "Voluntário(a)",
};

/** Dias de culto (0 = domingo … 6 = sábado). Voluntários só abrem culto nesses dias; a gestão abre em qualquer dia. */
export const DIAS_DE_CULTO = [0, 4] as const;
export const DIAS_DE_CULTO_TEXTO = "domingos e quintas-feiras";
/** Nome sugerido para a escala/culto conforme o dia da semana. */
export const TITULO_POR_DIA: Partial<Record<number, string>> = { 0: "Culto de Domingo", 4: "Culto de Quinta" };

export const STATUS_ESCALA = { pendente: "Aguardando resposta", aceita: "Aceita", recusada: "Recusada" } as const;
