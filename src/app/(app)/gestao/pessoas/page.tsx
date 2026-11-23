import { asc, desc } from "drizzle-orm";
import { CreateUserForm, MemberRow } from "@/components/equipe/team";
import { Panel, PanelHeader } from "@/components/panel";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireGestao } from "@/lib/session";

export const metadata = { title: "Pessoas · Gestão" };

export default async function Pessoas() {
  const me = await requireGestao();
  const members = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, defaultFunction: users.defaultFunction })
    .from(users)
    .orderBy(desc(users.active), asc(users.name));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Panel className="self-start">
        <PanelHeader title="Pessoas" action={<span className="font-mono text-sm text-ink-50">{members.filter((m) => m.active).length} ativas</span>} />
        {members.map((m) => (
          <MemberRow key={m.id} member={m} isMe={m.id === me.id} />
        ))}
      </Panel>
      <div className="grid gap-6 self-start">
        <Panel>
          <PanelHeader title="Cadastrar pessoa" />
          <CreateUserForm />
        </Panel>
        <Panel>
          <PanelHeader title="Perfis" />
          <dl className="grid gap-3 px-5 py-5 text-sm sm:px-6">
            <div>
              <dt className="font-bold">Pastor(a), Líder e Coordenação</dt>
              <dd className="text-muted-foreground">Área de gestão: acompanham os cultos, cadastram pessoas, publicam comunicados e alteram os checklists.</dd>
            </div>
            <div>
              <dt className="font-bold">Voluntário(a)</dt>
              <dd className="text-muted-foreground">Serve no dia a dia: escala, checklists, problemas e comunicados.</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
