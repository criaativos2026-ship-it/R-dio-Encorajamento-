"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { assignments, services } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { FUNCOES } from "@/lib/constants";
import { serviceDate } from "@/lib/format";
import { getActiveService } from "@/lib/queries";
import { requireGestao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

const openSchema = z.object({
  title: z.string().trim().min(2, "Informe o nome do culto.").max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
  time: z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido.")]),
  function: z.enum(FUNCOES),
});

/** Abre um culto. Qualquer voluntário pode abrir, para a equipe não depender de uma pessoa só. */
export async function openService(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = openSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (await getActiveService()) return { error: "Já existe um culto aberto. Encerre-o antes de abrir outro." };

  const { title, date, time } = parsed.data;
  const [service] = await db.insert(services).values({ title, date, time: time || null, createdBy: user.id }).returning();
  await db.insert(assignments).values({ serviceId: service.id, userId: user.id, function: parsed.data.function });
  await logActivity("culto", `Abriu o culto: ${title} (${serviceDate(date)}${time ? `, ${time.replace(":", "h")}` : ""})`, user.id, service.id);
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

export async function joinRoster(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
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
  const user = await requireUser();
  const service = await getActiveService();
  if (!service) return;
  await db.delete(assignments).where(and(eq(assignments.serviceId, service.id), eq(assignments.userId, user.id)));
  await logActivity("escala", "Saiu da escala", user.id, service.id);
  revalidatePath("/");
}
