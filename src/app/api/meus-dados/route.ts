import { asc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { activities, assignments, checklistItems, checks, notices, problems, services, users } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { PERFIL_LABEL } from "@/lib/constants";
import { AVISO_VERSAO, CONTROLADOR } from "@/lib/privacidade";
import { requireUser } from "@/lib/session";

/**
 * Portabilidade / acesso aos dados (LGPD, art. 18, II e V): devolve, em JSON,
 * tudo o que o app guarda sobre a pessoa logada. Nunca inclui a senha.
 */
export async function GET() {
  const me = await requireUser();

  const [escala, marcacoes, problemas, comunicados, atividades] = await Promise.all([
    db
      .select({ culto: services.title, data: services.date, funcao: assignments.function, em: assignments.createdAt })
      .from(assignments)
      .innerJoin(services, eq(services.id, assignments.serviceId))
      .where(eq(assignments.userId, me.id))
      .orderBy(asc(assignments.createdAt)),
    db
      .select({ culto: services.title, data: services.date, checklist: checklistItems.kind, item: checklistItems.label, em: checks.checkedAt })
      .from(checks)
      .innerJoin(services, eq(services.id, checks.serviceId))
      .innerJoin(checklistItems, eq(checklistItems.id, checks.itemId))
      .where(eq(checks.userId, me.id))
      .orderBy(asc(checks.checkedAt)),
    db
      .select({ titulo: problems.title, detalhes: problems.description, prioridade: problems.severity, situacao: problems.status, registrado_em: problems.createdAt, resolvido_em: problems.resolvedAt, solucao: problems.resolutionNote, criadoPorMim: problems.createdBy, resolvidoPorMim: problems.resolvedBy })
      .from(problems)
      .where(or(eq(problems.createdBy, me.id), eq(problems.resolvedBy, me.id)))
      .orderBy(asc(problems.createdAt)),
    db.select({ titulo: notices.title, mensagem: notices.body, publicado_em: notices.createdAt }).from(notices).where(eq(notices.createdBy, me.id)).orderBy(asc(notices.createdAt)),
    db.select({ tipo: activities.type, descricao: activities.message, em: activities.createdAt }).from(activities).where(eq(activities.userId, me.id)).orderBy(asc(activities.createdAt)),
  ]);

  const [perfil] = await db
    .select({ nome: users.name, email: users.email, perfil: users.role, funcao_principal: users.defaultFunction, conta_criada_em: users.createdAt, ativa: users.active, aviso_aceito_em: users.privacyAcceptedAt, versao_do_aviso: users.privacyVersion, exclusao_solicitada_em: users.deletionRequestedAt })
    .from(users)
    .where(eq(users.id, me.id));

  const body = {
    sobre: `Dados pessoais guardados pelo app Controle Interação — Rádio Encorajamento (${CONTROLADOR}). Gerado em ${new Date().toISOString()}. Aviso de privacidade versão ${AVISO_VERSAO}.`,
    perfil: { ...perfil, perfil: PERFIL_LABEL[perfil.perfil] },
    escala_nos_cultos: escala,
    itens_marcados_nos_checklists: marcacoes,
    problemas: problemas.map(({ criadoPorMim, resolvidoPorMim, ...p }) => ({ ...p, registrado_por_mim: criadoPorMim === me.id, resolvido_por_mim: resolvidoPorMim === me.id })),
    comunicados_publicados: comunicados,
    historico_de_atividades: atividades,
  };

  await logActivity("privacidade", "Baixou uma cópia dos próprios dados", me.id);
  const fileName = `meus-dados-controle-interacao-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
