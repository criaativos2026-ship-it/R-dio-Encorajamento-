import { redirect } from "next/navigation";
import { countUsers } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  if ((await countUsers()) === 0) redirect("/configurar");
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-eyebrow text-brand-text">Bem-vindo(a)</p>
      <h2 className="mt-2 text-3xl font-black tracking-display">Entrar</h2>
      <p className="mt-2 text-sm text-muted">Use o e-mail cadastrado pela coordenação.</p>
      <LoginForm />
    </>
  );
}
