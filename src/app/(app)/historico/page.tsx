import Link from "next/link";
import { ActivityList, type ActivityItem } from "@/components/activity-list";
import { PageHeader } from "@/components/ui/heading";
import { Empty, Panel } from "@/components/ui/panel";
import { dayHeading } from "@/lib/format";
import { getActivities } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Histórico" };

const PAGE = 100;

export default async function Historico({ searchParams }: { searchParams: Promise<{ mais?: string }> }) {
  await requireUser();
  const pages = Math.min(Math.max(Number((await searchParams).mais) || 1, 1), 20);
  const items = await getActivities(PAGE * pages + 1);
  const hasMore = items.length > PAGE * pages;
  const shown = items.slice(0, PAGE * pages);

  const days: { label: string; items: ActivityItem[] }[] = [];
  for (const a of shown) {
    const label = dayHeading(a.createdAt);
    const last = days.at(-1);
    if (last?.label === label) last.items.push(a);
    else days.push({ label, items: [a] });
  }

  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeader kicker="Registro da equipe" title="Histórico" description="Tudo o que foi feito, por quem e quando." />
      {days.length === 0 ? (
        <Panel>
          <Empty>Nenhuma atividade registrada ainda.</Empty>
        </Panel>
      ) : (
        <div className="grid gap-8">
          {days.map((d) => (
            <section key={d.label}>
              <h2 className="mb-3 flex items-center gap-3 text-xs font-semibold tracking-eyebrow text-ink-50 uppercase">
                <span aria-hidden className="h-px w-8 bg-brand" />
                {d.label}
              </h2>
              <Panel>
                <ActivityList items={d.items} />
              </Panel>
            </section>
          ))}
        </div>
      )}
      {hasMore && (
        <div className="mt-8 text-center">
          <Link href={`/historico?mais=${pages + 1}`} scroll={false} className="text-sm font-semibold text-brand-text hover:underline">
            Carregar mais
          </Link>
        </div>
      )}
    </main>
  );
}
