import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { PERFIS_GESTAO } from "@/lib/constants";

/** Usuário atual, conferido no banco a cada requisição (contas desativadas perdem acesso na hora). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user && user.active ? user : null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

/** Pastor(a), líder ou coordenação. */
export const isGestao = (u: Pick<User, "role">) => PERFIS_GESTAO.includes(u.role);

export async function requireGestao() {
  const user = await requireUser();
  if (!isGestao(user)) redirect("/");
  return user;
}
