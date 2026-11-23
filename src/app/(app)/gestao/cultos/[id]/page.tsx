import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { z } from "zod";
import { ActivityList } from "@/components/activity-list";
import { Empty, ListRow } from "@/components/list";
import { Panel, PanelHeader } from "@/components/panel";
import { PrintButton } from "@/components/print-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEVERIDADE } from "@/lib/constants";
import { initials, serviceDate, time, when } from "@/lib/format";
import { getServiceReport } from "@/lib/queries";
import { requireGestao } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Relatório do culto · Gestão" };

export default async function RelatorioCulto({ params }: { params: Promise<{ id: string }> }) {
  await requireGestao();
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const r = await getServiceReport(id.data);
  if (!r) notFound();

  const checklists = [
    { title: "Montagem", data: r.montagem },
    { title: "Desmontagem", data: r.desmontagem },
  ];
  const openProblems = r.problems.filter((p) => p.status === "aberto").length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/gestao" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline">
          <ArrowLeft className="size-4" /> Todos os cultos
        </Link>
        <PrintButton />
      </div>

      {/* Cabeçalho do relatório */}
      <section className="rounded-2xl bg-night p-6 text-white sm:p-8">
        <p className="font-mono text-xs font-semibold tracking-[0.12em] text-white/60 uppercase sm:tracking-eyebrow">
          {serviceDate(r.date)}
          {r.time ? ` · ${r.time.replace(":", "h")}` : ""}
        </p>
        <h2 className="mt-3 text-[34px] leading-tight font-black tracking-display sm:text-5xl">{r.title}</h2>
        <p className="mt-3 text-sm text-white/60">
          Aberto por {r.openedBy ?? "—"} · {when(r.createdAt)}
          {r.closedAt ? ` · Encerrado ${when(r.closedAt).toLowerCase()}` : " · Em andamento"}
        </p>
      </section>

      {/* Resumo */}
      <div className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 xl:grid-cols-4">
        {checklists.map(({ title, data }, i) => (
          <div key={title} className="flex flex-col gap-2 border-b border-line p-6 sm:odd:border-r xl:border-r xl:border-b-0">
            <span className="font-mono text-xs text-ink-35">{String(i + 1).padStart(2, "0")}</span>
            <p className="text-[11px] font-bold tracking-[0.15em] text-ink-50 uppercase">{title}</p>
            <p className="text-[28px] leading-tight font-black tracking-display">
              {data.completed}/{data.total}
            </p>
            <Progress value={data.pct} aria-label={`${title}: ${data.pct}%`} />
          </div>
        ))}
        <div className="flex flex-col gap-2 border-b border-line p-6 sm:border-r xl:border-b-0">
          <span className="font-mono text-xs text-ink-35">03</span>
          <p className="text-[11px] font-bold tracking-[0.15em] text-ink-50 uppercase">Escala</p>
          <p className="text-[28px] leading-tight font-black tracking-display">{r.roster.length}</p>
        </div>
        <div className="flex flex-col gap-2 p-6">
          <span className="font-mono text-xs text-ink-35">04</span>
          <p className="text-[11px] font-bold tracking-[0.15em] text-ink-50 uppercase">Problemas</p>
          <p className={cn("text-[28px] leading-tight font-black tracking-display", openProblems > 0 && "text-brand-text")}>
            {r.problems.length}
            {openProblems > 0 && <span className="ml-2 text-sm font-bold">({openProblems} aberto{openProblems > 1 ? "s" : ""})</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Panel className="self-start">
          <PanelHeader title="Escala" />
          {r.roster.length === 0 ? (
            <Empty>Ninguém entrou na escala.</Empty>
          ) : (
            r.roster.map((p) => (
              <ListRow key={p.userId} className="items-center">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[15px] font-semibold">{p.name}</p>
                  <p className="text-[13px] text-ink-50">{p.function}</p>
                </div>
              </ListRow>
            ))
          )}
        </Panel>

        <Panel className="self-start">
          <PanelHeader title="Problemas" />
          {r.problems.length === 0 ? (
            <Empty>Nenhum problema registrado neste culto.</Empty>
          ) : (
            r.problems.map((p) => (
              <ListRow key={p.id}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-[15px] font-semibold", p.status === "resolvido" && "text-ink-50")}>{p.title}</p>
                    {p.status === "resolvido" ? (
                      <Badge variant="secondary">Resolvido</Badge>
                    ) : (
                      <Badge variant={p.severity === "alta" ? "default" : "brand"}>{SEVERIDADE[p.severity]}</Badge>
                    )}
                  </div>
                  {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                  {p.resolutionNote && <p className="mt-1 text-sm">Solução: {p.resolutionNote}</p>}
                  <p className="mt-1 text-[13px] text-ink-50">
                    {p.author} · {time(p.createdAt)}
                    {p.resolvedAt ? ` · resolvido por ${p.resolver} às ${time(p.resolvedAt)}` : ""}
                  </p>
                </div>
              </ListRow>
            ))
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {checklists.map(({ title, data }) => (
          <Panel key={title} className="self-start">
            <PanelHeader title={title} action={<span className="font-mono text-sm text-ink-50">{data.pct}%</span>} />
            {data.groups.map((g) => (
              <div key={g.name} className="border-t border-line first:border-t-0">
                <p className="px-5 pt-4 pb-1 text-[11px] font-bold tracking-eyebrow text-ink-50 uppercase sm:px-6">{g.name}</p>
                {g.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-2.5 sm:px-6">
                    <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm", item.done ? "bg-ink text-white" : "border-2 border-ink-25")}>
                      {item.done && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-semibold", item.done && "text-ink-50")}>{item.label}</p>
                      <p className="text-xs text-ink-50">
                        {item.done ? (
                          `${item.done.by} · ${time(item.done.at)}`
                        ) : (
                          <span className="inline-flex items-center gap-1 text-brand-text">
                            <Clock className="size-3" /> Pendente
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Panel>
        ))}
      </div>

      <Panel>
        <PanelHeader title="Linha do tempo" />
        <ActivityList items={r.timeline} empty="Nenhuma atividade registrada neste culto." />
      </Panel>
    </div>
  );
}
