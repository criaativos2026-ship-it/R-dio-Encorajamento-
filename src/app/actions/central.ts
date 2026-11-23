"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { notices, problems } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { getActiveService } from "@/lib/queries";
import { requireGestao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

const problemSchema = z.object({
  title: z.string().trim().min(3, "Descreva o problema em poucas palavras.").max(100),
  description: z.string().trim().max(1000).optional(),
  severity: z.enum(["baixa", "media", "alta"]),
});

export async function createProblem(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = problemSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const service = await getActiveService();
  await db.insert(problems).values({ ...parsed.data, description: parsed.data.description || null, createdBy: user.id, serviceId: service?.id ?? null });
  await logActivity("problema", `Registrou problema: ${parsed.data.title}`, user.id, service?.id);
  revalidatePath("/", "layout");
  return { ok: "Problema registrado." };
}

const resolveSchema = z.object({ id: z.string().uuid(), note: z.string().trim().max(500).optional() });

export async function resolveProblem(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = resolveSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Dados inválidos." };
  const [p] = await db
    .update(problems)
    .set({ status: "resolvido", resolvedBy: user.id, resolvedAt: new Date(), resolutionNote: parsed.data.note || null })
    .where(and(eq(problems.id, parsed.data.id), eq(problems.status, "aberto")))
    .returning();
  if (p) await logActivity("resolvido", `Resolveu: ${p.title}`, user.id, p.serviceId);
  revalidatePath("/", "layout");
  return { ok: "Resolvido." };
}

const noticeSchema = z.object({
  title: z.string().trim().min(3, "Informe um título.").max(100),
  body: z.string().trim().min(3, "Escreva a mensagem.").max(2000),
  pinned: z.literal("on").optional(),
});

export async function createNotice(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireGestao();
  const parsed = noticeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(notices).values({ title: parsed.data.title, body: parsed.data.body, pinned: !!parsed.data.pinned, createdBy: user.id });
  await logActivity("comunicado", `Publicou comunicado: ${parsed.data.title}`, user.id);
  revalidatePath("/", "layout");
  return { ok: "Comunicado publicado." };
}

export async function togglePinNotice(id: string) {
  await requireGestao();
  const noticeId = z.string().uuid().parse(id);
  const [n] = await db.select().from(notices).where(eq(notices.id, noticeId)).limit(1);
  if (!n) return;
  await db.update(notices).set({ pinned: !n.pinned }).where(eq(notices.id, noticeId));
  revalidatePath("/", "layout");
}

export async function deleteNotice(id: string) {
  const user = await requireGestao();
  const noticeId = z.string().uuid().parse(id);
  const [n] = await db.delete(notices).where(eq(notices.id, noticeId)).returning();
  if (n) await logActivity("sistema", `Removeu o comunicado: ${n.title}`, user.id);
  revalidatePath("/", "layout");
}
