import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { ConvidarForm, ExcluirEscala, RetirarDaEscala } from "@/components/escalas/gestao-forms";
import { StatusEscala } from "@/components/escalas/status-badge";
import { Empty, ListRow } from "@/components/list";
import { Panel, PanelHeader } from "@/components/panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInvitablePeople, getScheduleDetail } from "@/lib/escalas";
import { initials, serviceDate, todayISO, when } from "@/lib/format";
import { requireGestao } from "@/lib/session";

export const metadata = { title: "Escala · Gestão" };

export default async function EscalaDetalhe({ params }: { params: Promise<{ id: string }> }) {
  await requireGestao();
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const [e, pessoas] = await Promise.all([getScheduleDetail(id.data), getInvitablePeople()]);
  if (!e) notFound();
  const passou = e.date < todayISO();
  const convidados = new Set(e.slots.filter((s) => s.status !== "recusada").map((s) => s.userId));
  const disponiveis = pessoas.filter((p) => !convidados.has(p.id));
  const conta = (st: string) => e.slots.filter((s) => s.status === st).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/gestao/escalas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline">
          <ArrowLeft className="size-4" /> Todas as escalas
        </Link>
        {!passou && <ExcluirEscala scheduleId={e.id} />}
      </div>

      <section className="rounded-2xl bg-night p-6 text-white sm:p-8">
        <p className="font-mono text-xs font-semibold tracking-[0.12em] text-white/60 uppercase sm:tracking-eyebrow">{serviceDate(e.date)}</p>
        <h2 className="mt-3 text-[34px] leading-tight font-black tracking-display sm:text-5xl">{e.title}</h2>
        {e.notes && <p className="mt-3 text-sm text-white/70">{e.notes}</p>}
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80">
          <span>
            <strong className="text-white">{conta("aceita")}</strong> aceitaram
          </span>
          <span>
            <strong className="text-brand">{conta("pendente")}</strong> aguardando
          </span>
          <span>
            <strong className="text-white">{conta("recusada")}</strong> recusaram
          </span>
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="self-start">
          <PanelHeader title="Convidados" />
          {e.slots.length === 0 ? (
            <Empty>Ninguém convidado ainda.</Empty>
          ) : (
            e.slots.map((s) => (
              <ListRow key={s.id} className="items-center">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">{initials(s.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold">{s.name}</p>
                    <StatusEscala status={s.status} />
                  </div>
                  <p className="text-[13px] text-ink-50">
                    {s.function}
                    {s.respondedAt ? ` · respondeu ${when(new Date(s.respondedAt)).toLowerCase()}` : ` · convidado(a) ${when(new Date(s.invitedAt)).toLowerCase()}`}
                  </p>
                  {s.status === "recusada" && s.responseNote && <p className="mt-1 text-sm text-muted-foreground">Motivo: {s.responseNote}</p>}
                </div>
                {!passou && <RetirarDaEscala slotId={s.id} name={s.name} />}
              </ListRow>
            ))
          )}
        </Panel>
        {!passou && (
          <Panel className="self-start">
            <PanelHeader title="Convidar pessoa" />
            {disponiveis.length === 0 ? <Empty>Todas as pessoas ativas já foram convidadas.</Empty> : <ConvidarForm scheduleId={e.id} pessoas={disponiveis} />}
            <p className="border-t border-line px-5 py-3 text-xs text-ink-50 sm:px-6">Quem recusou pode ser convidado de novo: o convite volta para “Aguardando resposta”.</p>
          </Panel>
        )}
      </div>
    </div>
  );
}
