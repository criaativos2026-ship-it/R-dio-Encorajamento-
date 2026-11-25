import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CriarEscalaForm } from "@/components/escalas/gestao-forms";
import { Empty } from "@/components/list";
import { Panel, PanelHeader } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { DIAS_DE_CULTO, TITULO_POR_DIA } from "@/lib/constants";
import { getSchedulesOverview } from "@/lib/escalas";
import { nextDatesOn, serviceDate, todayISO } from "@/lib/format";
import { requireGestao } from "@/lib/session";

export const metadata = { title: "Escalas · Gestão" };

type Item = Awaited<ReturnType<typeof getSchedulesOverview>>["upcoming"][number];

export default async function EscalasGestao() {
  await requireGestao();
  const { upcoming, past } = await getSchedulesOverview();
  const hoje = todayISO();
  const sugestoes = nextDatesOn(DIAS_DE_CULTO, 4, hoje).map((date) => ({ date, label: serviceDate(date) }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid gap-6 self-start">
        <Panel>
          <PanelHeader kicker="Montar" title="Próximas escalas" />
          {upcoming.length === 0 ? <Empty>Nenhuma escala criada. Comece pelo formulário ao lado.</Empty> : upcoming.map((s) => <Linha key={s.id} s={s} />)}
        </Panel>
        {past.length > 0 && (
          <Panel>
            <PanelHeader title="Escalas que já passaram" />
            {past.map((s) => (
              <Linha key={s.id} s={s} />
            ))}
          </Panel>
        )}
      </div>
      <Panel className="self-start">
        <PanelHeader title="Criar escala" />
        <CriarEscalaForm sugestoes={sugestoes} titulos={TITULO_POR_DIA as Record<number, string>} hoje={hoje} />
      </Panel>
    </div>
  );
}

function Linha({ s }: { s: Item }) {
  const total = s.pendente + s.aceita + s.recusada;
  return (
    <Link href={`/gestao/escalas/${s.id}`} className="flex items-center gap-4 border-t border-line px-5 py-4 transition-colors first:border-t-0 hover:bg-muted/60 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold">{serviceDate(s.date)}</p>
        <p className="text-sm text-muted-foreground">{s.title}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {total === 0 ? (
            <Badge variant="outline">Ninguém convidado</Badge>
          ) : (
            <>
              <Badge variant="secondary">{s.aceita} aceitaram</Badge>
              {s.pendente > 0 && <Badge variant="brand">{s.pendente} aguardando</Badge>}
              {s.recusada > 0 && <Badge variant="outline">{s.recusada} recusaram</Badge>}
            </>
          )}
        </div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-ink-35" />
    </Link>
  );
}
