import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { and, count, eq, inArray } from "drizzle-orm";
import { Empty } from "@/components/list";
import { Panel, PanelHeader } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { db } from "@/db";
import { users } from "@/db/schema";
import { PERFIS_GESTAO } from "@/lib/constants";
import { serviceDate } from "@/lib/format";
import { countOpenProblems, getServicesOverview } from "@/lib/queries";
import { requireGestao } from "@/lib/session";

export const metadata = { title: "Gestão" };

export default async function GestaoOverview() {
  await requireGestao();
  const [cultos, openProblems, [volunteers], [gestao]] = await Promise.all([
    getServicesOverview(30),
    countOpenProblems(),
    db.select({ n: count() }).from(users).where(and(eq(users.active, true), eq(users.role, "voluntario"))),
    db.select({ n: count() }).from(users).where(and(eq(users.active, true), inArray(users.role, [...PERFIS_GESTAO]))),
  ]);
  const aberto = cultos.find((c) => !c.closedAt);

  const stats = [
    { n: "01", label: "Culto em andamento", value: aberto ? aberto.title : "Nenhum", href: aberto ? `/gestao/cultos/${aberto.id}` : undefined },
    { n: "02", label: "Problemas abertos", value: String(openProblems), href: "/central", hl: openProblems > 0 },
    { n: "03", label: "Voluntários ativos", value: String(volunteers?.n ?? 0), href: "/gestao/pessoas" },
    { n: "04", label: "Pessoas na gestão", value: String(gestao?.n ?? 0), href: "/gestao/pessoas" },
  ];

  return (
    <div className="grid gap-10">
      <div className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <>
              <span className="font-mono text-xs text-ink-35">{s.n}</span>
              <p className="text-[11px] font-bold tracking-[0.15em] text-ink-50 uppercase">{s.label}</p>
              <p className={`truncate text-[28px] leading-tight font-black tracking-display ${s.hl ? "text-brand-text" : ""}`}>{s.value}</p>
            </>
          );
          const cls = "flex flex-col gap-2 border-b border-line p-6 transition-colors sm:odd:border-r xl:border-r xl:border-b-0 xl:last:border-r-0";
          return s.href ? (
            <Link key={s.n} href={s.href} className={`${cls} hover:bg-muted/60`}>
              {body}
            </Link>
          ) : (
            <div key={s.n} className={cls}>
              {body}
            </div>
          );
        })}
      </div>

      <Panel>
        <PanelHeader kicker="Relatórios" title="Cultos" />
        {cultos.length === 0 ? (
          <Empty>Nenhum culto registrado ainda.</Empty>
        ) : (
          <ul>
            {cultos.map((c) => (
              <li key={c.id} className="border-t border-line first:border-t-0">
                <Link href={`/gestao/cultos/${c.id}`} className="grid gap-4 px-5 py-5 transition-colors hover:bg-muted/60 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
                      {c.title}
                      {c.closedAt ? <Badge variant="secondary">Encerrado</Badge> : <Badge variant="brand">Em andamento</Badge>}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-50">
                      {serviceDate(c.date)}
                      {c.time ? `, aberto às ${c.time.replace(":", "h")}` : ""} · {c.roster} na escala
                      {c.totalProblems > 0 && ` · ${c.totalProblems} problema${c.totalProblems > 1 ? "s" : ""}${c.openProblems ? ` (${c.openProblems} aberto${c.openProblems > 1 ? "s" : ""})` : ""}`}
                    </p>
                  </div>
                  <MiniProgress label="Montagem" p={c.montagem} />
                  <MiniProgress label="Desmontagem" p={c.desmontagem} />
                  <ArrowRight className="hidden size-4 text-ink-35 lg:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function MiniProgress({ label, p }: { label: string; p: { completed: number; total: number; pct: number } }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span className="font-mono text-ink-50">
          {p.completed}/{p.total}
        </span>
      </div>
      <Progress value={p.pct} aria-label={`${label}: ${p.pct}%`} />
    </div>
  );
}
