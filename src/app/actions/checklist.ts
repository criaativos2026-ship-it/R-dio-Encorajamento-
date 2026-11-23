"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { checklistItems, checks } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { CHECKLIST_LABEL } from "@/lib/constants";
import { getActiveService, getChecklist, isMontagemConcluida } from "@/lib/queries";
import { requireGestao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

const toggleSchema = z.object({ itemId: z.string().uuid(), checked: z.boolean() });

export async function toggleCheck(input: { itemId: string; checked: boolean }) {
  const user = await requireUser();
  const { itemId, checked } = toggleSchema.parse(input);
  const service = await getActiveService();
  if (!service) return { error: "Nenhum culto aberto." };

  const [item] = await db.select().from(checklistItems).where(eq(checklistItems.id, itemId)).limit(1);
  if (!item || !item.active) return { error: "Item não encontrado." };
  const label = CHECKLIST_LABEL[item.kind];

  // Regra da equipe: desmontagem bloqueada até a montagem estar 100% concluída.
  if (item.kind === "desmontagem" && !(await isMontagemConcluida(service.id)))
    return { error: "A desmontagem só é liberada depois que a montagem estiver concluída." };

  if (checked) {
    const inserted = await db
      .insert(checks)
      .values({ serviceId: service.id, itemId, userId: user.id })
      .onConflictDoNothing()
      .returning();
    if (inserted.length) {
      await logActivity("check", `${label}: ${item.label}`, user.id, service.id);
      const progress = await getChecklist(item.kind, service.id);
      if (progress.total > 0 && progress.completed === progress.total)
        await logActivity("checklist_concluido", `Checklist de ${label.toLowerCase()} concluído`, user.id, service.id);
    }
  } else {
    const removed = await db
      .delete(checks)
      .where(and(eq(checks.serviceId, service.id), eq(checks.itemId, itemId)))
      .returning();
    if (removed.length) await logActivity("uncheck", `${label}: desmarcou "${item.label}"`, user.id, service.id);
  }
  revalidatePath("/", "layout");
  return {};
}

// ---------- Edição do modelo (gestão) ----------

const kindSchema = z.enum(["montagem", "desmontagem"]);

const addSchema = z.object({
  kind: kindSchema,
  group: z.string().trim().min(2, "Informe o grupo.").max(40),
  label: z.string().trim().min(2, "Descreva o item.").max(140),
});

export async function addChecklistItem(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireGestao();
  const parsed = addSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { kind, group, label } = parsed.data;

  // Insere logo após o último item do mesmo grupo (ou no fim, se o grupo for novo).
  const items = await db.select().from(checklistItems).where(and(eq(checklistItems.kind, kind), eq(checklistItems.active, true))).orderBy(checklistItems.position);
  const lastOfGroup = [...items].reverse().find((i) => i.group === group);
  const position = lastOfGroup ? lastOfGroup.position + 1 : (items.at(-1)?.position ?? -1) + 1;
  await db.transaction(async (tx) => {
    for (const i of items.filter((i) => i.position >= position))
      await tx.update(checklistItems).set({ position: i.position + 1 }).where(eq(checklistItems.id, i.id));
    await tx.insert(checklistItems).values({ kind, group, label, position });
  });
  await logActivity("sistema", `Adicionou ao checklist de ${CHECKLIST_LABEL[kind].toLowerCase()}: ${label}`, user.id);
  revalidatePath("/", "layout");
  return { ok: "Item adicionado." };
}

export async function removeChecklistItem(itemId: string) {
  const user = await requireGestao();
  const id = z.string().uuid().parse(itemId);
  const [item] = await db.update(checklistItems).set({ active: false }).where(eq(checklistItems.id, id)).returning();
  if (item) await logActivity("sistema", `Removeu do checklist de ${CHECKLIST_LABEL[item.kind].toLowerCase()}: ${item.label}`, user.id);
  revalidatePath("/", "layout");
}

export async function moveChecklistItem(itemId: string, direction: "up" | "down") {
  await requireGestao();
  const id = z.string().uuid().parse(itemId);
  const [item] = await db.select().from(checklistItems).where(eq(checklistItems.id, id)).limit(1);
  if (!item) return;
  const siblings = await db
    .select()
    .from(checklistItems)
    .where(and(eq(checklistItems.kind, item.kind), eq(checklistItems.group, item.group), eq(checklistItems.active, true)))
    .orderBy(checklistItems.position);
  const idx = siblings.findIndex((s) => s.id === id);
  const other = siblings[direction === "up" ? idx - 1 : idx + 1];
  if (!other) return;
  await db.transaction(async (tx) => {
    await tx.update(checklistItems).set({ position: other.position }).where(eq(checklistItems.id, item.id));
    await tx.update(checklistItems).set({ position: item.position }).where(eq(checklistItems.id, other.id));
  });
  revalidatePath("/", "layout");
}

export async function resetChecklist(kind: "montagem" | "desmontagem") {
  const user = await requireGestao();
  const k = kindSchema.parse(kind);
  const service = await getActiveService();
  if (!service) return;
  const ids = (await db.select({ id: checklistItems.id }).from(checklistItems).where(eq(checklistItems.kind, k))).map((r) => r.id);
  for (const itemId of ids) await db.delete(checks).where(and(eq(checks.serviceId, service.id), eq(checks.itemId, itemId)));
  await logActivity("sistema", `Reiniciou o checklist de ${CHECKLIST_LABEL[k].toLowerCase()}`, user.id, service.id);
  revalidatePath("/", "layout");
}
