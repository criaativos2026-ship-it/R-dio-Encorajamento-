import { asc, desc } from "drizzle-orm";
import { ChecklistEditor } from "@/components/equipe/checklist-editor";
import { CreateUserForm, MemberRow } from "@/components/equipe/team";
import { PageHeader } from "@/components/ui/heading";
import { Panel, PanelHeader } from "@/components/panel";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getChecklist } from "@/lib/queries";
import { requireCoordenacao } from "@/lib/session";

export const metadata = { title: "Equipe" };

export default async function Equipe() {
  const me = await requireCoordenacao();
  const [members, montagem, desmontagem] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, defaultFunction: users.defaultFunction })
      .from(users)
      .orderBy(desc(users.active), asc(users.name)),
    getChecklist("montagem", null),
    getChecklist("desmontagem", null),
  ]);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeader kicker="Coordenação" title="Equipe" description="Cadastre voluntários, defina quem coordena e ajuste os checklists." />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="self-start">
          <PanelHeader title="Pessoas" action={<span className="font-mono text-sm text-ink-50">{members.filter((m) => m.active).length} ativas</span>} />
          {members.map((m) => (
            <MemberRow key={m.id} member={m} isMe={m.id === me.id} />
          ))}
        </Panel>
        <Panel className="self-start">
          <PanelHeader title="Cadastrar pessoa" />
          <CreateUserForm />
        </Panel>
      </div>

      <div id="checklists" className="mt-14 mb-5 scroll-mt-28">
        <p className="text-xs font-semibold tracking-eyebrow text-brand-text uppercase">Modelos</p>
        <h2 className="mt-2 text-[28px] font-black tracking-display sm:text-[40px]">Checklists</h2>
        <p className="mt-2 text-sm text-muted-foreground">As mudanças valem para todos os cultos. O que já foi marcado continua no histórico.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="self-start">
          <PanelHeader title="Montagem" />
          <ChecklistEditor kind="montagem" groups={montagem.groups} />
        </Panel>
        <Panel className="self-start">
          <PanelHeader title="Desmontagem" />
          <ChecklistEditor kind="desmontagem" groups={desmontagem.groups} />
        </Panel>
      </div>
    </main>
  );
}
