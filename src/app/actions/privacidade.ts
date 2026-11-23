"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { and, count, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { activities, notices, problems, users } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { PERFIS_GESTAO } from "@/lib/constants";
import { AVISO_VERSAO, NOME_ANONIMO } from "@/lib/privacidade";
import { getCurrentUser, isGestao, requireGestao, requireUser } from "@/lib/session";
import type { FormState } from "./types";

/** Registra o aceite do aviso de privacidade (versão e momento, pelo relógio do servidor). */
export async function acceptPrivacy(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (form.get("concordo") !== "on") return { error: "Para usar o app, marque que você leu e concorda com o aviso." };
  await db.update(users).set({ privacyAcceptedAt: new Date(), privacyVersion: AVISO_VERSAO }).where(eq(users.id, user.id));
  await logActivity("privacidade", `Aceitou o aviso de privacidade (versão ${AVISO_VERSAO})`, user.id);
  redirect("/");
}

/** Titular pede a exclusão dos próprios dados (LGPD, art. 18, VI). A gestão executa. */
export async function requestDeletion() {
  const me = await requireUser();
  await db.update(users).set({ deletionRequestedAt: new Date() }).where(eq(users.id, me.id));
  await logActivity("privacidade", "Pediu a exclusão dos próprios dados", me.id);
  revalidatePath("/", "layout");
  return {};
}

export async function cancelDeletion() {
  const me = await requireUser();
  await db.update(users).set({ deletionRequestedAt: null }).where(eq(users.id, me.id));
  await logActivity("privacidade", "Cancelou o pedido de exclusão dos dados", me.id);
  revalidatePath("/", "layout");
  return {};
}

/** Correção de dados (art. 18, III): troca do próprio e-mail, confirmada pela senha. */
export async function changeOwnEmail(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().email("E-mail inválido."), password: z.string().min(1, "Informe sua senha.") })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await bcrypt.compare(parsed.data.password, me.passwordHash))) return { error: "Senha incorreta." };
  if (parsed.data.email === me.email) return { error: "Esse já é o seu e-mail." };
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (exists) return { error: "Esse e-mail já está em uso." };
  await db.update(users).set({ email: parsed.data.email }).where(eq(users.id, me.id));
  await logActivity("privacidade", "Alterou o e-mail de acesso", me.id);
  revalidatePath("/", "layout");
  return { ok: "E-mail alterado. Use o novo e-mail no próximo login." };
}

/**
 * Exclusão por anonimização (art. 18, VI; art. 16): apaga nome, e-mail, senha e função da pessoa
 * e troca o nome dela por "Pessoa removida" no histórico, nos problemas e nos comunicados.
 * Os registros dos cultos continuam (sem identificar ninguém), para os relatórios seguirem corretos.
 */
export async function anonymizeUser(userId: string) {
  const me = await requireGestao();
  const id = z.string().uuid().parse(userId);
  if (id === me.id) return { error: "Para excluir a sua própria conta, peça a outra pessoa da gestão." };

  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!u || u.anonymizedAt) return { error: "Pessoa não encontrada." };
  if (isGestao(u)) {
    const [row] = await db
      .select({ n: count() })
      .from(users)
      .where(and(inArray(users.role, [...PERFIS_GESTAO]), eq(users.active, true), ne(users.id, id)));
    if ((row?.n ?? 0) === 0) return { error: "É preciso manter ao menos uma pessoa ativa na gestão." };
  }

  const name = u.name;
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        name: NOME_ANONIMO,
        email: `removido-${id}@anonimo.invalid`,
        passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
        defaultFunction: null,
        role: "voluntario",
        active: false,
        deletionRequestedAt: null,
        privacyAcceptedAt: null,
        privacyVersion: null,
        anonymizedAt: new Date(),
      })
      .where(eq(users.id, id));
    // Retira o nome de textos que o citam (ex.: "Cadastrou Fulano na equipe").
    await tx.update(activities).set({ message: sql`replace(${activities.message}, ${name}, ${NOME_ANONIMO})` });
    await tx
      .update(problems)
      .set({
        title: sql`replace(${problems.title}, ${name}, ${NOME_ANONIMO})`,
        description: sql`replace(${problems.description}, ${name}, ${NOME_ANONIMO})`,
        resolutionNote: sql`replace(${problems.resolutionNote}, ${name}, ${NOME_ANONIMO})`,
      });
    await tx
      .update(notices)
      .set({ title: sql`replace(${notices.title}, ${name}, ${NOME_ANONIMO})`, body: sql`replace(${notices.body}, ${name}, ${NOME_ANONIMO})` });
  });
  await logActivity("privacidade", "Excluiu (anonimizou) os dados de uma pessoa a pedido ou por decisão da gestão", me.id);
  revalidatePath("/", "layout");
  return {};
}
