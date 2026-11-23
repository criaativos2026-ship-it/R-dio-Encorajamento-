"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { FUNCOES } from "@/lib/constants";
import { countUsers } from "@/lib/queries";
import type { FormState } from "./types";

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").slice(0, 160);
  try {
    await signIn("credentials", {
      email,
      password: String(form.get("password") ?? ""),
      redirectTo: "/",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      const code = (e as AuthError & { code?: string }).code;
      // Devolve o e-mail para o formulário não obrigar a digitar de novo.
      return { email, error: code === "muitas_tentativas" ? "Muitas tentativas. Aguarde 15 minutos e tente de novo." : "E-mail ou senha incorretos." };
    }
    throw e;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/entrar" });
}

const setupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(200),
  role: z.enum(["pastor", "lider", "coordenacao"]),
});

/** Primeiro acesso: cria a primeira conta da gestão. Só funciona enquanto não houver nenhum usuário. */
export async function setupFirstUser(_: FormState, form: FormData): Promise<FormState> {
  if ((await countUsers()) > 0) redirect("/entrar");
  const parsed = setupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, role } = parsed.data;
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await bcrypt.hash(password, 12), role, defaultFunction: FUNCOES[0] })
    .returning();
  await logActivity("sistema", "Configurou o Controle Interação", user.id);
  await signIn("credentials", { email, password, redirectTo: "/" });
}
