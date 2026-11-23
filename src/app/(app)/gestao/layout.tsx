import { GestaoTabs } from "@/components/shell/gestao-tabs";
import { PageHeader } from "@/components/ui/heading";
import { PERFIL_LABEL } from "@/lib/constants";
import { purgeExpiredData } from "@/lib/retencao";
import { requireGestao } from "@/lib/session";

export default async function GestaoLayout({ children }: { children: React.ReactNode }) {
  const user = await requireGestao();
  await purgeExpiredData(); // prazo de guarda (LGPD)
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeader kicker={`Área de gestão · ${PERFIL_LABEL[user.role]}`} title="Gestão" description="Acompanhe os cultos, organize a equipe e ajuste os checklists." />
      <GestaoTabs />
      {children}
    </main>
  );
}
