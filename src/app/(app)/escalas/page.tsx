import { CalendarDays } from "lucide-react";
import { ResponderEscala } from "@/components/escalas/responder";
import { StatusEscala } from "@/components/escalas/status-badge";
import { Empty, ListRow } from "@/components/list";
import { Panel, PanelHeader } from "@/components/panel";
import { PageHeader } from "@/components/ui/heading";
import { serviceDate, when } from "@/lib/format";
import { getMyInvitations } from "@/lib/escalas";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Minhas escalas" };

export default async function MinhasEscalas() {
  const user = await requireUser();
  const { upcoming, past } = await getMyInvitations(user.id);
  const pendentes = upcoming.filter((i) => i.status === "pendente").length;

  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeader
        kicker="Servir"
        title="Minhas escalas"
        description="A gestão monta as escalas. Aqui você aceita ou recusa cada convite. Dá para mudar a resposta até o dia do culto."
      />

      <Panel>
        <PanelHeader title="Próximos cultos" action={pendentes > 0 ? <span className="font-mono text-sm text-brand-text">{pendentes} para responder</span> : undefined} />
        {upcoming.length === 0 ? (
          <Empty>Nenhuma escala por enquanto. Quando a gestão te convidar, aparece aqui.</Empty>
        ) : (
          upcoming.map((i) => (
            <ListRow key={i.id} className={cn(i.status === "pendente" && "bg-primary/[0.04]")}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-ink">
                <CalendarDays className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-bold">{serviceDate(i.date)}</p>
                  <StatusEscala status={i.status} />
                </div>
                <p className="mt-0.5 text-sm">
                  {i.title} · <strong>{i.function}</strong>
                </p>
                {i.notes && <p className="mt-1 text-sm text-muted-foreground">{i.notes}</p>}
                {i.status === "recusada" && i.responseNote && <p className="mt-1 text-sm text-muted-foreground">Seu motivo: {i.responseNote}</p>}
                {i.respondedAt && <p className="mt-1 text-xs text-ink-50">Respondido {when(new Date(i.respondedAt)).toLowerCase()}</p>}
                <ResponderEscala slotId={i.id} status={i.status} />
              </div>
            </ListRow>
          ))
        )}
      </Panel>

      {past.length > 0 && (
        <Panel className="mt-6">
          <PanelHeader title="Cultos que já passaram" />
          {past.map((i) => (
            <ListRow key={i.id}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold text-ink-50">{serviceDate(i.date)}</p>
                  <StatusEscala status={i.status} />
                </div>
                <p className="mt-0.5 text-sm text-ink-50">
                  {i.title} · {i.function}
                </p>
              </div>
            </ListRow>
          ))}
        </Panel>
      )}
    </main>
  );
}
