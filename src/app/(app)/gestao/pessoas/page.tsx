import { asc, desc, isNull } from "drizzle-orm";
import { CreateUserForm, MemberRow } from "@/components/equipe/team";
import { Panel, PanelHeader } from "@/components/panel";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireGestao } from "@/lib/session";

export const metadata = { title: "Pessoas · Gestão" };

export default async function Pessoas() {
  const me = await requireGestao();
  const members = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, defaultFunction: users.defaultFunction, deletionRequestedAt: users.deletionRequestedAt })
    .from(users)
    .where(isNull(users.anonymizedAt)) // pessoas excluídas (anonimizadas) não aparecem mais
    .orderBy(desc(users.deletionRequestedAt), desc(users.active), asc(users.name));
  const pedidos = members.filter((m) => m.deletionRequestedAt).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Panel className="self-start">
        {pedidos > 0 && (
          <p className="border-b border-line bg-primary/10 px-5 py-3 text-sm font-semibold text-brand-text sm:px-6">
            {pedidos === 1 ? "1 pessoa pediu" : `${pedidos} pessoas pediram`} a exclusão dos dados (LGPD). Conclua em “Excluir dados”.
          </p>
        )}
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
            <div>
              <dt className="font-bold">Excluir dados (LGPD)</dt>
              <dd className="text-muted-foreground">Apaga nome, e-mail e acesso da pessoa; nos registros antigos ela aparece como “Pessoa removida”. Não pode ser desfeito.</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
