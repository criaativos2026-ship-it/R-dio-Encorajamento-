import Link from "next/link";
import { Megaphone, Pin } from "lucide-react";
import { NoticeActions, NoticeForm, ProblemForm, ResolveForm } from "@/components/central/forms";
import { PageHeader } from "@/components/ui/heading";
import { Empty, ListRow as Row } from "@/components/list";
import { Panel, PanelHeader } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SEVERIDADE } from "@/lib/constants";
import { when } from "@/lib/format";
import { getNotices, getProblems } from "@/lib/queries";
import { isGestao, requireUser } from "@/lib/session";

export const metadata = { title: "Central" };

export default async function Central({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const user = await requireUser();
  const tab = (await searchParams).aba === "comunicados" ? "comunicados" : "problemas";
  const coord = isGestao(user);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeader kicker="Fique por dentro" title="Central" description="Registre ocorrências e acompanhe os comunicados da gestão." />

      <div role="tablist" className="mb-8 inline-flex rounded-2xl border border-line-15 bg-surface p-1">
        {(["problemas", "comunicados"] as const).map((t) => (
          <Link
            key={t}
            role="tab"
            aria-selected={tab === t}
            href={t === "problemas" ? "/central" : "/central?aba=comunicados"}
            className={cn("rounded-xl px-5 py-2 text-sm font-bold capitalize transition-colors", tab === t ? "bg-ink text-white" : "text-ink-50 hover:text-ink")}
          >
            {t}
          </Link>
        ))}
      </div>

      {tab === "problemas" ? <Problemas /> : <Comunicados coord={coord} />}
    </main>
  );
}

async function Problemas() {
  const problems = await getProblems();
  const open = problems.filter((p) => p.status === "aberto");
  const resolved = problems.filter((p) => p.status === "resolvido");
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid gap-6 self-start">
        <Panel>
          <PanelHeader title="Abertos" action={<Badge variant={open.length ? "brand" : "secondary"}>{open.length}</Badge>} />
          {open.length === 0 ? (
            <Empty>Nenhum problema aberto.</Empty>
          ) : (
            open.map((p) => (
              <Row key={p.id}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold">{p.title}</p>
                    <Badge variant={p.severity === "alta" ? "default" : p.severity === "media" ? "brand" : "outline"}>
                      <span className="size-1.5 rounded-full bg-current" />
                      {SEVERIDADE[p.severity]}
                    </Badge>
                  </div>
                  {p.description && <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{p.description}</p>}
                  <p className="mt-1.5 text-[13px] text-ink-50">
                    {p.author} · {when(p.createdAt)}
                  </p>
                  <ResolveForm id={p.id} />
                </div>
              </Row>
            ))
          )}
        </Panel>
        {resolved.length > 0 && (
          <Panel>
            <PanelHeader title="Resolvidos" />
            {resolved.slice(0, 30).map((p) => (
              <Row key={p.id}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-ink-50">{p.title}</p>
                    <Badge variant="secondary">
                      <span className="size-1.5 rounded-full bg-current" />
                      Resolvido
                    </Badge>
                  </div>
                  {p.resolutionNote && <p className="mt-1.5 text-sm text-muted-foreground">{p.resolutionNote}</p>}
                  <p className="mt-1.5 text-[13px] text-ink-50">
                    Aberto por {p.author} · resolvido por {p.resolver} · {p.resolvedAt && when(p.resolvedAt)}
                  </p>
                </div>
              </Row>
            ))}
          </Panel>
        )}
      </div>
      <Panel id="registrar" className="scroll-mt-28 self-start">
        <PanelHeader title="Registrar problema" />
        <ProblemForm />
      </Panel>
    </div>
  );
}

async function Comunicados({ coord }: { coord: boolean }) {
  const notices = await getNotices();
  return (
    <div className={cn("grid gap-6", coord && "lg:grid-cols-[1.5fr_1fr]")}>
      <Panel className="self-start">
        <PanelHeader title="Mural da equipe" />
        {notices.length === 0 ? (
          <Empty>Nenhum comunicado publicado.</Empty>
        ) : (
          notices.map((n) => (
            <Row key={n.id}>
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", n.pinned ? "bg-brand text-white" : "bg-bg-alt text-ink-50")}>
                {n.pinned ? <Pin className="size-4" /> : <Megaphone className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{n.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-ink/80">{n.body}</p>
                <p className="mt-1.5 text-[13px] text-ink-50">
                  {n.author} · {when(n.createdAt)}
                </p>
              </div>
              {coord && <NoticeActions id={n.id} pinned={n.pinned} />}
            </Row>
          ))
        )}
      </Panel>
      {coord && (
        <Panel className="self-start">
          <PanelHeader title="Novo comunicado" />
          <NoticeForm />
        </Panel>
      )}
    </div>
  );
}
