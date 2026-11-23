import { ChecklistEditor } from "@/components/equipe/checklist-editor";
import { Panel, PanelHeader } from "@/components/panel";
import { getChecklist } from "@/lib/queries";
import { requireGestao } from "@/lib/session";

export const metadata = { title: "Checklists · Gestão" };

export default async function Checklists() {
  await requireGestao();
  const [montagem, desmontagem] = await Promise.all([getChecklist("montagem", null), getChecklist("desmontagem", null)]);
  return (
    <>
      <p className="mb-5 text-sm text-muted-foreground">As mudanças valem para os próximos cultos. O que já foi marcado continua no histórico.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="self-start">
          <PanelHeader title="Montagem" action={<span className="font-mono text-sm text-ink-50">{montagem.total} itens</span>} />
          <ChecklistEditor kind="montagem" groups={montagem.groups} />
        </Panel>
        <Panel className="self-start">
          <PanelHeader title="Desmontagem" action={<span className="font-mono text-sm text-ink-50">{desmontagem.total} itens</span>} />
          <ChecklistEditor kind="desmontagem" groups={desmontagem.groups} />
        </Panel>
      </div>
    </>
  );
}
