"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { assignments, schedules, scheduleSlots, users } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { FUNCOES } from "@/lib/constants";
import { serviceDate, todayISO } from "@/lib/format";
import { getActiveService } from "@/lib/queries";
import { requireGestao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");

// ---------- Gestão ----------

const createSchema = z.object({
  date: isoDate,
  title: z.string().trim().min(2, "Informe o nome do culto.").max(80),
  notes: z.string().trim().max(500).optional(),
});

/** Cria a escala de um culto (data de hoje em diante). */
export async function createSchedule(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireGestao();
  const parsed = createSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { date, title, notes } = parsed.data;
  if (date < todayISO()) return { error: "Escolha hoje ou uma data futura." };
  const [dup] = await db.select({ id: schedules.id }).from(schedules).where(and(eq(schedules.date, date), eq(schedules.title, title))).limit(1);
  if (dup) return { error: "Já existe uma escala com esse nome nessa data." };
  await db.insert(schedules).values({ date, title, notes: notes || null, createdBy: me.id });
  await logActivity("escala", `Criou a escala: ${title} (${serviceDate(date)})`, me.id);
  revalidatePath("/", "layout");
  return { ok: "Escala criada. Agora convide as pessoas." };
}

export async function deleteSchedule(scheduleId: string) {
  const me = await requireGestao();
  const id = z.string().uuid().parse(scheduleId);
  const [s] = await db.delete(schedules).where(eq(schedules.id, id)).returning();
  if (s) await logActivity("escala", `Excluiu a escala: ${s.title} (${serviceDate(s.date)})`, me.id);
  revalidatePath("/", "layout");
  return {};
}

const inviteSchema = z.object({
  scheduleId: z.string().uuid(),
  userId: z.string().uuid("Escolha uma pessoa."),
  function: z.enum(FUNCOES, { message: "Escolha uma função." }),
});

/** Convida uma pessoa (fica "Aguardando resposta"). Reconvidar quem recusou volta para pendente. */
export async function inviteToSchedule(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireGestao();
  const parsed = inviteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { scheduleId, userId, function: fn } = parsed.data;

  const [s] = await db.select().from(schedules).where(eq(schedules.id, scheduleId)).limit(1);
  if (!s) return { error: "Escala não encontrada." };
  if (s.date < todayISO()) return { error: "Essa escala já passou." };
  const [u] = await db.select().from(users).where(and(eq(users.id, userId), eq(users.active, true))).limit(1);
  if (!u) return { error: "Pessoa não encontrada ou desativada." };

  const [existing] = await db.select().from(scheduleSlots).where(and(eq(scheduleSlots.scheduleId, scheduleId), eq(scheduleSlots.userId, userId))).limit(1);
  if (existing && existing.status !== "recusada") return { error: `${u.name} já está nesta escala.` };
  if (existing) {
    await db
      .update(scheduleSlots)
      .set({ function: fn, status: "pendente", responseNote: null, respondedAt: null, invitedBy: me.id, createdAt: new Date() })
      .where(eq(scheduleSlots.id, existing.id));
  } else {
    await db.insert(scheduleSlots).values({ scheduleId, userId, function: fn, invitedBy: me.id });
  }
  await logActivity("escala", `Convidou ${u.name} para ${s.title} (${serviceDate(s.date)}) como ${fn}`, me.id);
  revalidatePath("/", "layout");
  return { ok: `${u.name} foi convidado(a). Aguardando resposta.` };
}

export async function removeFromSchedule(slotId: string) {
  const me = await requireGestao();
  const id = z.string().uuid().parse(slotId);
  const [row] = await db
    .select({ slot: scheduleSlots, name: users.name, s: schedules })
    .from(scheduleSlots)
    .innerJoin(users, eq(users.id, scheduleSlots.userId))
    .innerJoin(schedules, eq(schedules.id, scheduleSlots.scheduleId))
    .where(eq(scheduleSlots.id, id))
    .limit(1);
  if (!row) return { error: "Convite não encontrado." };
  await db.delete(scheduleSlots).where(eq(scheduleSlots.id, id));
  await syncRoster(row.s.date, row.slot.userId, null);
  await logActivity("escala", `Retirou ${row.name} da escala ${row.s.title} (${serviceDate(row.s.date)})`, me.id);
  revalidatePath("/", "layout");
  return {};
}

// ---------- Voluntário (o próprio convidado) ----------

const respondSchema = z.object({
  slotId: z.string().uuid(),
  answer: z.enum(["aceitar", "recusar"]),
  note: z.string().trim().max(300).optional(),
});

/** Aceitar ou recusar a própria escala. Pode mudar a resposta até o dia do culto. */
export async function respondToSchedule(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = respondSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Resposta inválida." };
  const { slotId, answer, note } = parsed.data;

  const [row] = await db
    .select({ slot: scheduleSlots, s: schedules })
    .from(scheduleSlots)
    .innerJoin(schedules, eq(schedules.id, scheduleSlots.scheduleId))
    .where(and(eq(scheduleSlots.id, slotId), eq(scheduleSlots.userId, me.id))) // só a própria escala
    .limit(1);
  if (!row) return { error: "Escala não encontrada." };
  if (row.s.date < todayISO()) return { error: "Essa escala já passou." };

  const status = answer === "aceitar" ? "aceita" : "recusada";
  await db
    .update(scheduleSlots)
    .set({ status, respondedAt: new Date(), responseNote: status === "recusada" ? note || null : null })
    .where(eq(scheduleSlots.id, slotId));
  await syncRoster(row.s.date, me.id, status === "aceita" ? row.slot.function : null);
  await logActivity(
    "escala",
    `${status === "aceita" ? "Aceitou" : "Recusou"} a escala ${row.s.title} (${serviceDate(row.s.date)}) como ${row.slot.function}`,
    me.id,
  );
  revalidatePath("/", "layout");
  return { ok: status === "aceita" ? "Escala aceita. Obrigado por servir!" : "Escala recusada. A gestão foi avisada." };
}

/**
 * Mantém a "Escala de hoje" do culto aberto coerente com as respostas:
 * se o culto da data já estiver aberto, aceitar adiciona a pessoa; recusar/remover tira.
 */
async function syncRoster(date: string, userId: string, fn: string | null) {
  const service = await getActiveService();
  if (!service || service.date !== date) return;
  if (fn) {
    await db
      .insert(assignments)
      .values({ serviceId: service.id, userId, function: fn })
      .onConflictDoUpdate({ target: [assignments.serviceId, assignments.userId], set: { function: fn } });
  } else {
    await db.delete(assignments).where(and(eq(assignments.serviceId, service.id), eq(assignments.userId, userId)));
  }
}
