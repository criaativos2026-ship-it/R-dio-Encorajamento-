"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { FUNCOES } from "@/lib/constants";
import { requireCoordenacao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

const password = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(200);

const createSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password,
  role: z.enum(["voluntario", "coordenacao"]),
  defaultFunction: z.enum(FUNCOES),
});

export async function createUser(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireCoordenacao();
  const parsed = createSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, role, defaultFunction } = parsed.data;
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists) return { error: "Já existe uma pessoa com esse e-mail." };
  await db.insert(users).values({ name, email, role, defaultFunction, passwordHash: await bcrypt.hash(parsed.data.password, 12) });
  await logActivity("sistema", `Cadastrou ${name} na equipe`, me.id);
  revalidatePath("/equipe");
  return { ok: `${name} foi cadastrado(a). Envie o e-mail e a senha provisória para a pessoa.` };
}

/** Garante que sempre reste pelo menos uma conta de coordenação ativa. */
async function otherActiveCoordinators(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(users)
    .where(and(eq(users.role, "coordenacao"), eq(users.active, true), ne(users.id, userId)));
  return row?.n ?? 0;
}

export async function setUserRole(userId: string, role: "voluntario" | "coordenacao") {
  const me = await requireCoordenacao();
  const id = z.string().uuid().parse(userId);
  const r = z.enum(["voluntario", "coordenacao"]).parse(role);
  if (r === "voluntario" && (await otherActiveCoordinators(id)) === 0) return { error: "É preciso manter ao menos uma pessoa na coordenação." };
  const [u] = await db.update(users).set({ role: r }).where(eq(users.id, id)).returning();
  if (u) await logActivity("sistema", `Alterou o perfil de ${u.name} para ${r === "coordenacao" ? "coordenação" : "voluntário"}`, me.id);
  revalidatePath("/equipe");
  return {};
}

export async function setUserActive(userId: string, active: boolean) {
  const me = await requireCoordenacao();
  const id = z.string().uuid().parse(userId);
  if (!active && id === me.id) return { error: "Você não pode desativar a própria conta." };
  if (!active && (await otherActiveCoordinators(id)) === 0) {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    if (u?.role === "coordenacao") return { error: "É preciso manter ao menos uma pessoa na coordenação." };
  }
  const [u] = await db.update(users).set({ active }).where(eq(users.id, id)).returning();
  if (u) await logActivity("sistema", `${active ? "Reativou" : "Desativou"} o acesso de ${u.name}`, me.id);
  revalidatePath("/equipe");
  return {};
}

export async function resetUserPassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireCoordenacao();
  const parsed = z.object({ id: z.string().uuid(), password }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const [u] = await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.password, 12) })
    .where(eq(users.id, parsed.data.id))
    .returning();
  if (u) await logActivity("sistema", `Redefiniu a senha de ${u.name}`, me.id);
  return { ok: "Senha provisória definida." };
}

export async function changeOwnPassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = z
    .object({ current: z.string().min(1, "Informe a senha atual."), next: password, confirm: z.string() })
    .refine((v) => v.next === v.confirm, { message: "A confirmação não confere." })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await bcrypt.compare(parsed.data.current, me.passwordHash))) return { error: "Senha atual incorreta." };
  await db.update(users).set({ passwordHash: await bcrypt.hash(parsed.data.next, 12) }).where(eq(users.id, me.id));
  return { ok: "Senha alterada." };
}

export async function updateOwnProfile(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = z
    .object({ name: z.string().trim().min(2, "Informe seu nome.").max(80), defaultFunction: z.enum(FUNCOES) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.update(users).set(parsed.data).where(eq(users.id, me.id));
  revalidatePath("/", "layout");
  return { ok: "Perfil atualizado." };
}
