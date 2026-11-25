"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { assignments, services } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { DIAS_DE_CULTO, DIAS_DE_CULTO_TEXTO, FUNCOES } from "@/lib/constants";
import { addAcceptedToService } from "@/lib/escalas";
import { clockNow, serviceDate, todayISO, weekdayName, weekdayOf } from "@/lib/format";
import { getActiveService } from "@/lib/queries";
import { isGestao, requireGestao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

const openSchema = z.object({
  title: z.string().trim().min(2, "Informe o nome do culto.").max(80),
  // Só a gestão escolhe a própria função ao abrir (ou "" = não vai servir neste culto).
  function: z.union([z.literal(""), z.enum(FUNCOES)]).optional(),
});

/**
 * Abre um culto. Data e horário vêm do relógio do servidor (fuso de São Carlos).
 * Voluntários: só aos domingos e quintas. Gestão: qualquer dia.
 * Quem aceitou a escala da data entra automaticamente na escala do dia.
 */
export async function openService(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const gestao = isGestao(user);
  const parsed = openSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const now = new Date();
  const date = todayISO(now);
  if (!gestao && !(DIAS_DE_CULTO as readonly number[]).includes(weekdayOf(date)))
    return { error: `Voluntários só podem abrir culto aos ${DIAS_DE_CULTO_TEXTO}. Hoje é ${weekdayName(date)}: peça para alguém da gestão.` };
  if (await getActiveService()) return { error: "Já existe um culto aberto. Encerre-o antes de abrir outro." };

  const { title } = parsed.data;
  const time = clockNow(now);
  const [service] = await db.insert(services).values({ title, date, time, createdBy: user.id }).returning();
  if (gestao && parsed.data.function)
    await db.insert(assignments).values({ serviceId: service.id, userId: user.id, function: parsed.data.function });
  const fromSchedule = await addAcceptedToService(service.id, date);
  await logActivity(
    "culto",
    `Abriu o culto: ${title} (${serviceDate(date)}, às ${time.replace(":", "h")})${fromSchedule ? ` · ${fromSchedule} da escala` : ""}`,
    user.id,
    service.id,
  );
  revalidatePath("/", "layout");
}

export async function closeService() {
  const user = await requireGestao();
  const service = await getActiveService();
  if (!service) return;
  await db.update(services).set({ closedAt: new Date() }).where(eq(services.id, service.id));
  await logActivity("culto", `Encerrou o culto: ${service.title}`, user.id, service.id);
  revalidatePath("/", "layout");
}

/** Entrar na escala do dia sem convite: só a gestão (voluntários entram pela escala aceita). */
export async function joinRoster(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireGestao();
  const fn = z.enum(FUNCOES).safeParse(form.get("function"));
  if (!fn.success) return { error: "Escolha uma função." };
  const service = await getActiveService();
  if (!service) return { error: "Nenhum culto aberto." };
  await db
    .insert(assignments)
    .values({ serviceId: service.id, userId: user.id, function: fn.data })
    .onConflictDoUpdate({ target: [assignments.serviceId, assignments.userId], set: { function: fn.data } });
  await logActivity("escala", `Entrou na escala como ${fn.data}`, user.id, service.id);
  revalidatePath("/");
}

export async function leaveRoster() {
  const user = await requireGestao();
  const service = await getActiveService();
  if (!service) return;
  await db.delete(assignments).where(and(eq(assignments.serviceId, service.id), eq(assignments.userId, user.id)));
  await logActivity("escala", "Saiu da escala", user.id, service.id);
  revalidatePath("/");
}
