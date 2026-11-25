import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarClock, Lock, Radio } from "lucide-react";
import { ActivityList } from "@/components/activity-list";
import { HeroVideo } from "@/components/hero-video";
import { CloseServiceButton } from "@/components/painel/close-service";
import { OpenServiceForm } from "@/components/painel/open-service-form";
import { JoinRoster, LeaveRoster } from "@/components/painel/roster";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eyebrow, Hl } from "@/components/ui/heading";
import { ListRow as Row } from "@/components/list";
import { Panel, PanelHeader } from "@/components/panel";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DIAS_DE_CULTO, DIAS_DE_CULTO_TEXTO, FUNCOES, SEVERIDADE, TITULO_POR_DIA } from "@/lib/constants";
import { countMyPending, getMyNextAccepted, isCultoDay } from "@/lib/escalas";
import { clockNow, firstName, greeting, initials, nextDatesOn, serviceDate, todayISO, weekdayName, weekdayOf, when } from "@/lib/format";
import { getActiveService, getActivities, getNotices, getProblems, getProgress, getRoster } from "@/lib/queries";
import { isGestao, requireUser } from "@/lib/session";

export const metadata = { title: "Painel" };

const RADIO_URL = "https://radioencorajamento.com.br/"; // mesmo link usado no site da igreja

export default async function Painel() {
  const user = await requireUser();
  const service = await getActiveService();
  const gestao = isGestao(user);
  const [montagem, desmontagem, openProblems, notices, activity, roster, pendingInvites, nextAccepted] = await Promise.all([
    getProgress("montagem", service?.id ?? null),
    getProgress("desmontagem", service?.id ?? null),
    getProblems({ onlyOpen: true, limit: 3 }),
    getNotices(1),
    getActivities(6),
    service ? getRoster(service.id) : Promise.resolve([]),
    countMyPending(user.id),
    getMyNextAccepted(user.id),
  ]);
  // Voluntários só abrem culto aos domingos e quintas; a gestão abre em qualquer dia.
  const today = todayISO();
  const podeAbrir = gestao || isCultoDay(today);
  const proximoCulto = nextDatesOn(DIAS_DE_CULTO, 1, today)[0];
  const me = roster.find((r) => r.userId === user.id);
  const defaultFunction = user.defaultFunction ?? FUNCOES[0];
  const notice = notices[0];
  const pending = montagem.total - montagem.completed + (desmontagem.total - desmontagem.completed);

  let summary: string;
  let next: { href: string; label: string } | null = null;
  if (!service)
    summary = podeAbrir
      ? "Nenhum culto aberto. Abra o culto de hoje para começar a montagem."
      : `Hoje é ${weekdayName(today)}. Os cultos são abertos aos ${DIAS_DE_CULTO_TEXTO}.`;
  else if (montagem.pct < 100) {
    const faltam = montagem.total - montagem.completed;
    summary = montagem.completed === 0 ? "A montagem ainda não começou." : `A montagem está em andamento. ${faltam === 1 ? "Falta 1 etapa" : `Faltam ${faltam} etapas`} para a rádio ficar pronta.`;
    next = { href: "/checklist/montagem", label: montagem.completed === 0 ? "Iniciar montagem" : "Continuar montagem" };
  } else if (desmontagem.pct < 100) {
    summary = "Montagem concluída. Rádio pronta. Ao fim do culto, siga para a desmontagem.";
    next = { href: "/checklist/desmontagem", label: desmontagem.completed ? "Continuar desmontagem" : "Iniciar desmontagem" };
  } else summary = "Montagem e desmontagem concluídas. Obrigado pelo serviço!";

  return (
    <>
      {/* Faixa escura: mesmo padrão do topo do site */}
      <section className="relative overflow-hidden bg-night text-white">
        <HeroVideo />
        <div className="relative mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[440px] lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Eyebrow light>{service ? `${serviceDate(service.date)} · ${service.title}${service.time ? ` · aberto às ${service.time.replace(":", "h")}` : ""}` : serviceDate(todayISO())}</Eyebrow>
            <h1 className="mt-5 text-[44px] leading-[1.02] font-black tracking-display sm:text-[64px]">
              {greeting()},
              <br />
              <span className="text-brand">{firstName(user.name)}.</span>
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/60 sm:text-base">
              {me ? `${me.function} hoje. ` : ""}
              {summary}
            </p>
          </div>
          {service ? (
            <div className="flex flex-wrap gap-3">
              {next && (
                <Button asChild size="lg">
<Link href={next.href}>
         {next.label} <ArrowRight className="size-4" />
        </Link>
</Button>
              )}
              <a href={RADIO_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outlineLight", size: "lg" })}>
                <Radio className="size-4" /> Ouvir a rádio
              </a>
              {isGestao(user) && <CloseServiceButton pending={pending} />}
            </div>
          ) : (
            <div className="w-full lg:w-[380px]">
              {podeAbrir ? (
                <OpenServiceForm
                  nowLabel={`${serviceDate(today)}, ${clockNow().replace(":", "h")}`}
                  defaultFunction={defaultFunction}
                  defaultTitle={TITULO_POR_DIA[weekdayOf(today)] ?? "Culto"}
                  gestao={gestao}
                  foraDoDia={!isCultoDay(today)}
                />
              ) : (
                <div className="flex gap-4 rounded-2xl bg-card p-5 text-card-foreground sm:p-6">
                  <CalendarClock className="mt-0.5 size-5 shrink-0 text-brand-text" />
                  <div>
                    <p className="text-[11px] font-bold tracking-eyebrow text-brand-text uppercase">Hoje não tem culto</p>
                    <p className="mt-1.5 text-[15px] leading-relaxed">
                      Voluntários abrem o culto aos <strong>{DIAS_DE_CULTO_TEXTO}</strong>. Próximo culto: <strong>{serviceDate(proximoCulto)}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-12">
        {(pendingInvites > 0 || nextAccepted) && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {pendingInvites > 0 && (
              <Link href="/escalas" className="flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-brand-hover">
                <CalendarClock className="size-6 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-black">
                    {pendingInvites === 1 ? "Você tem 1 escala para responder" : `Você tem ${pendingInvites} escalas para responder`}
                  </p>
                  <p className="text-sm text-white/85">Toque para aceitar ou recusar.</p>
                </div>
                <ArrowRight className="size-5 shrink-0" />
              </Link>
            )}
            {nextAccepted && (
              <Link href="/escalas" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/60">
                <CalendarCheck className="size-6 shrink-0 text-ink" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.15em] text-ink-50 uppercase">Sua próxima escala</p>
                  <p className="text-[15px] font-bold">
                    {serviceDate(nextAccepted.date)} · {nextAccepted.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{nextAccepted.function}</p>
                </div>
              </Link>
            )}
          </div>
        )}
        {/* Grade numerada: mesmo desenho do bloco "Identidade" do site */}
        <div className="grid overflow-hidden rounded-2xl border border-line-15 bg-surface sm:grid-cols-2 xl:grid-cols-4">
          <StatusCell n="01" href="/checklist/montagem" title="Montagem" progress={montagem} active={!!service} />
          <StatusCell n="02" href="/checklist/desmontagem" title="Desmontagem" progress={desmontagem} active={!!service} lockedBy={montagem.pct < 100 ? montagem.total - montagem.completed : 0} />
          <Link href="/central" className="flex flex-col gap-2.5 border-b border-line p-6 transition-colors hover:bg-bg-alt/60 sm:p-7 xl:border-r xl:border-b-0">
            <span className="font-mono text-xs text-ink-35">03</span>
            <h3 className="mt-1 text-[22px] leading-tight font-black tracking-display sm:text-[26px]">
              {openProblems.length ? (
                <>
                  <Hl>{openProblems.length}</Hl> {openProblems.length === 1 ? "problema aberto" : "problemas abertos"}
                </>
              ) : (
                "Nenhum problema aberto"
              )}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {openProblems[0] ? `${openProblems[0].title}. Prioridade ${SEVERIDADE[openProblems[0].severity].toLowerCase()}.` : "Tudo certo por aqui."}
            </p>
            <GoLink>Ver central</GoLink>
          </Link>
          <Link href="/central?aba=comunicados" className="flex flex-col gap-2.5 bg-brand p-6 text-white transition-colors hover:bg-brand-hover sm:p-7">
            <span className="font-mono text-xs text-white/70">04</span>
            <h3 className="mt-1 text-[22px] leading-tight font-black tracking-display">{notice ? notice.title : "Nenhum comunicado"}</h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-white/90">{notice ? notice.body : "Os comunicados da gestão aparecem aqui."}</p>
            <GoLink light>Comunicados</GoLink>
          </Link>
        </div>

        <div className="mt-14 mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-brand-text">Equipe de serviço</p>
            <h2 className="mt-2 text-[28px] font-black tracking-display sm:text-[40px]">Atividade recente</h2>
          </div>
          <Link href="/historico" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-text hover:underline">
            Histórico completo <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Panel>
            <ActivityList items={activity} />
          </Panel>
          <Panel className="self-start">
            <PanelHeader kicker="Escala de hoje" action={me && gestao ? <LeaveRoster /> : undefined} />
            {!service ? (
              <p className="px-6 py-8 text-sm text-ink-50">A escala aparece quando um culto for aberto.</p>
            ) : roster.length === 0 ? (
              <p className="px-6 py-8 text-sm text-ink-50">Ninguém na escala ainda. Quem aceitar a escala deste culto aparece aqui.</p>
            ) : (
              roster.map((r) => (
                <Row key={r.userId} className="items-center">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold", r.userId === user.id ? "bg-ink text-white" : "bg-bg-alt text-ink")}>{initials(r.name)}</span>
                  <div>
                    <p className="text-[15px] font-semibold">{r.name}</p>
                    <p className="text-[13px] text-ink-50">{r.function}</p>
                  </div>
                </Row>
              ))
            )}
            {service && !me && gestao && <JoinRoster defaultFunction={defaultFunction} />}
          </Panel>
        </div>
        {service && <p className="mt-6 text-xs text-ink-35">Culto aberto {when(service.createdAt).toLowerCase()}.</p>}
      </main>
    </>
  );
}

function StatusCell({
  n,
  href,
  title,
  progress,
  active,
  lockedBy = 0,
}: {
  n: string;
  href: string;
  title: string;
  progress: { total: number; completed: number; pct: number; pendingGroups: string[]; doneGroups: string[] };
  active: boolean;
  /** Etapas da montagem que ainda faltam (a desmontagem fica bloqueada até zerar). */
  lockedBy?: number;
}) {
  const done = progress.pct === 100;
  const locked = active && lockedBy > 0;
  const state = !active ? null : done ? "concluída" : progress.completed > 0 ? "em curso" : null;
  const detail = !active
    ? "Disponível quando um culto for aberto."
    : locked
      ? `Liberada quando a montagem for concluída (${lockedBy === 1 ? "falta 1 etapa" : `faltam ${lockedBy} etapas`}).`
    : done
      ? "Todas as etapas concluídas."
      : progress.completed === 0
        ? `${progress.total} etapas em ${progress.pendingGroups.length} grupos.`
        : `${progress.doneGroups.length ? `${progress.doneGroups.join(", ")} ${progress.doneGroups.length > 1 ? "concluídos" : "concluído"}. ` : ""}Falta: ${progress.pendingGroups.join(", ")}.`;
  return (
    <Link href={href} className="flex flex-col gap-2.5 border-b border-line p-6 transition-colors hover:bg-bg-alt/60 sm:p-7 sm:odd:border-r xl:border-r xl:border-b-0">
      <span className="font-mono text-xs text-ink-35">{n}</span>
      <h3 className="mt-1 text-[22px] leading-tight font-black tracking-display sm:text-[26px]">
        {title} {locked ? <Lock className="mb-1 inline size-5 text-ink-35" aria-label="Bloqueada" /> : state && (done ? <span>{state}</span> : <Hl>{state}</Hl>)}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
      <div className="mt-auto pt-3">
        <div className="mb-2.5 flex justify-between text-[13px] font-semibold">
          <span>
            {progress.completed} de {progress.total} etapas
          </span>
          <span className="font-mono text-ink-50">{progress.pct}%</span>
        </div>
        <Progress value={progress.pct} aria-label={`Progresso da ${title.toLowerCase()}`} />
      </div>
    </Link>
  );
}

function GoLink({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={cn("mt-auto inline-flex items-center gap-3 pt-3 text-xs font-bold tracking-[0.15em] uppercase", light ? "text-white" : "text-brand-text")}>
      <span className="grid size-10 place-items-center rounded-full border border-current">
        <ArrowRight className="size-4" />
      </span>
      {children}
    </span>
  );
}
