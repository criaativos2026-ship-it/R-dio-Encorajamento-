import { redirect } from "next/navigation";
import { connection } from "next/server";
import { countUsers } from "@/lib/queries";
import { SetupForm } from "./setup-form";

export const metadata = { title: "Primeiro acesso" };

export default async function SetupPage() {
  await connection(); // sempre consulta o banco: a tela some depois do primeiro cadastro
  if ((await countUsers()) > 0) redirect("/entrar");
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-eyebrow text-brand-text">Primeiro acesso</p>
      <h2 className="mt-2 text-3xl font-black tracking-display">Criar a coordenação</h2>
      <p className="mt-2 text-sm text-muted-foreground">Esta conta poderá cadastrar os voluntários e ajustar os checklists. Esta tela só aparece uma vez.</p>
      <SetupForm />
    </>
  );
}
