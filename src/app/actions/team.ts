"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { FUNCOES, PERFIL_LABEL, PERFIS, PERFIS_GESTAO } from "@/lib/constants";
import { isGestao, requireGestao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

const password = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(200);

const createSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password,
  role: z.enum(PERFIS),
  defaultFunction: z.enum(FUNCOES),
});

export async function createUser(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireGestao();
  const parsed = createSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, role, defaultFunction } = parsed.data;
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists) return { error: "Já existe uma pessoa com esse e-mail." };
  await db.insert(users).values({ name, email, role, defaultFunction, passwordHash: await bcrypt.hash(parsed.data.password, 12) });
  await logActivity("sistema", `Cadastrou ${name} na equipe`, me.id);
  revalidatePath("/gestao", "layout");
  return { ok: `${name} foi cadastrado(a). Envie o e-mail e a senha provisória para a pessoa.` };
}

const MSG_GESTAO = "É preciso manter ao menos uma pessoa ativa na gestão (pastor, líder ou coordenação).";

/** Quantas outras pessoas ativas estão na gestão (para nunca ficar sem ninguém). */
async function otherActiveGestao(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(users)
    .where(and(inArray(users.role, [...PERFIS_GESTAO]), eq(users.active, true), ne(users.id, userId)));
  return row?.n ?? 0;
}

export async function setUserRole(userId: string, role: (typeof PERFIS)[number]) {
  const me = await requireGestao();
  const id = z.string().uuid().parse(userId);
  const r = z.enum(PERFIS).parse(role);
  if (!PERFIS_GESTAO.includes(r) && (await otherActiveGestao(id)) === 0) return { error: MSG_GESTAO };
  const [u] = await db.update(users).set({ role: r }).where(eq(users.id, id)).returning();
  if (u) await logActivity("sistema", `Alterou o perfil de ${u.name} para ${PERFIL_LABEL[r]}`, me.id);
  revalidatePath("/", "layout");
  return {};
}

export async function setUserActive(userId: string, active: boolean) {
  const me = await requireGestao();
  const id = z.string().uuid().parse(userId);
  if (!active && id === me.id) return { error: "Você não pode desativar a própria conta." };
  if (!active) {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    if (u && isGestao(u) && (await otherActiveGestao(id)) === 0) return { error: MSG_GESTAO };
  }
  const [u] = await db.update(users).set({ active }).where(eq(users.id, id)).returning();
  if (u) await logActivity("sistema", `${active ? "Reativou" : "Desativou"} o acesso de ${u.name}`, me.id);
  revalidatePath("/gestao", "layout");
  return {};
}

export async function resetUserPassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireGestao();
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
