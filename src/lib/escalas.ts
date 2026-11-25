import "server-only";
import { and, asc, count, eq, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { assignments, schedules, scheduleSlots, users } from "@/db/schema";
import { DIAS_DE_CULTO } from "@/lib/constants";
import { todayISO, weekdayOf } from "@/lib/format";

/**
 * Ao abrir um culto, quem aceitou a escala daquela data entra automaticamente na "Escala de hoje".
 * Módulo só do servidor (não é ação chamável pelo navegador).
 */
export async function addAcceptedToService(serviceId: string, date: string) {
  const accepted = await db
    .select({ userId: scheduleSlots.userId, function: scheduleSlots.function })
    .from(scheduleSlots)
    .innerJoin(schedules, eq(schedules.id, scheduleSlots.scheduleId))
    .where(and(eq(schedules.date, date), eq(scheduleSlots.status, "aceita")));
  for (const a of accepted) await db.insert(assignments).values({ serviceId, userId: a.userId, function: a.function }).onConflictDoNothing();
  return accepted.length;
}

/** Convites da pessoa: próximos (pendentes primeiro) e os últimos que já passaram. */
export async function getMyInvitations(userId: string) {
  const rows = await db
    .select({
      id: scheduleSlots.id,
      function: scheduleSlots.function,
      status: scheduleSlots.status,
      responseNote: scheduleSlots.responseNote,
      respondedAt: scheduleSlots.respondedAt,
      date: schedules.date,
      title: schedules.title,
      notes: schedules.notes,
      scheduleId: schedules.id,
    })
    .from(scheduleSlots)
    .innerJoin(schedules, eq(schedules.id, scheduleSlots.scheduleId))
    .where(eq(scheduleSlots.userId, userId))
    .orderBy(asc(schedules.date));
  const today = todayISO();
  const upcoming = rows.filter((r) => r.date >= today);
  const order = { pendente: 0, aceita: 1, recusada: 2 } as const;
  upcoming.sort((a, b) => order[a.status] - order[b.status] || a.date.localeCompare(b.date));
  const past = rows.filter((r) => r.date < today).reverse().slice(0, 10);
  return { upcoming, past };
}

export async function countMyPending(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(scheduleSlots)
    .innerJoin(schedules, eq(schedules.id, scheduleSlots.scheduleId))
    .where(and(eq(scheduleSlots.userId, userId), eq(scheduleSlots.status, "pendente"), gte(schedules.date, todayISO())));
  return row?.n ?? 0;
}

/** Resumo das escalas (próximas e algumas passadas) para a gestão. */
export async function getSchedulesOverview() {
  const list = await db.select().from(schedules).orderBy(asc(schedules.date), asc(schedules.title));
  const counts = await db
    .select({ scheduleId: scheduleSlots.scheduleId, status: scheduleSlots.status, n: count() })
    .from(scheduleSlots)
    .groupBy(scheduleSlots.scheduleId, scheduleSlots.status);
  const today = todayISO();
  const withCounts = list.map((s) => {
    const c = (st: "pendente" | "aceita" | "recusada") => counts.find((x) => x.scheduleId === s.id && x.status === st)?.n ?? 0;
    return { ...s, pendente: c("pendente"), aceita: c("aceita"), recusada: c("recusada") };
  });
  return {
    upcoming: withCounts.filter((s) => s.date >= today),
    past: withCounts.filter((s) => s.date < today).reverse().slice(0, 10),
  };
}

const inviter = alias(users, "inviter");

export async function getScheduleDetail(id: string) {
  const [s] = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
  if (!s) return null;
  const slots = await db
    .select({
      id: scheduleSlots.id,
      userId: scheduleSlots.userId,
      name: users.name,
      function: scheduleSlots.function,
      status: scheduleSlots.status,
      responseNote: scheduleSlots.responseNote,
      respondedAt: scheduleSlots.respondedAt,
      invitedAt: scheduleSlots.createdAt,
      invitedBy: inviter.name,
    })
    .from(scheduleSlots)
    .innerJoin(users, eq(users.id, scheduleSlots.userId))
    .leftJoin(inviter, eq(inviter.id, scheduleSlots.invitedBy))
    .where(eq(scheduleSlots.scheduleId, id))
    .orderBy(asc(scheduleSlots.function), asc(users.name));
  return { ...s, slots };
}

/** Pessoas ativas que podem ser convidadas. */
export async function getInvitablePeople() {
  return db
    .select({ id: users.id, name: users.name, defaultFunction: users.defaultFunction })
    .from(users)
    .where(eq(users.active, true))
    .orderBy(asc(users.name));
}

/** Próxima escala aceita da pessoa (para o Painel). */
export async function getMyNextAccepted(userId: string) {
  const [row] = await db
    .select({ date: schedules.date, title: schedules.title, function: scheduleSlots.function })
    .from(scheduleSlots)
    .innerJoin(schedules, eq(schedules.id, scheduleSlots.scheduleId))
    .where(and(eq(scheduleSlots.userId, userId), eq(scheduleSlots.status, "aceita"), gte(schedules.date, todayISO())))
    .orderBy(asc(schedules.date))
    .limit(1);
  return row ?? null;
}


/** Hoje é dia de culto (domingo ou quinta) no fuso de São Carlos? */
export function isCultoDay(date = todayISO()) {
  return (DIAS_DE_CULTO as readonly number[]).includes(weekdayOf(date));
}
