import "server-only";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { activities, notices, problems, schedules, services } from "@/db/schema";
import { RETENCAO_DIAS } from "@/lib/privacidade";

/**
 * Limpeza automática por prazo (LGPD, art. 15 e 16): apaga o que passou de RETENCAO_DIAS.
 * - cultos encerrados (com escala e marcações dos checklists) e escalas planejadas com convites e respostas;
 * - histórico de atividades;
 * - problemas resolvidos e comunicados não fixados.
 * Roda quando alguém da gestão abre a área de Gestão (no máximo uma vez a cada 6 h por servidor).
 */
let lastRun = 0;

export async function purgeExpiredData() {
  if (Date.now() - lastRun < 6 * 3600 * 1000) return;
  lastRun = Date.now();
  const limit = new Date(Date.now() - RETENCAO_DIAS * 86400 * 1000);
  await db.delete(services).where(and(isNotNull(services.closedAt), lt(services.closedAt, limit)));
  await db.delete(schedules).where(lt(schedules.date, limit.toISOString().slice(0, 10))); // escalas antigas (com convites)
  await db.delete(activities).where(lt(activities.createdAt, limit));
  await db.delete(problems).where(and(eq(problems.status, "resolvido"), lt(problems.resolvedAt, limit)));
  await db.delete(notices).where(and(eq(notices.pinned, false), lt(notices.createdAt, limit)));
}
