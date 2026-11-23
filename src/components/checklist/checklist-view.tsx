"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleCheck } from "@/app/actions/checklist";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { when } from "@/lib/format";

type Item = { id: string; label: string; done: { by: string; at: Date } | null };
type Group = { name: string; items: Item[] };

export function ChecklistView({ groups, userName, disabled }: { groups: Group[]; userName: string; disabled: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(groups, (state, { id, checked }: { id: string; checked: boolean }) =>
    state.map((g) => ({ ...g, items: g.items.map((i) => (i.id === id ? { ...i, done: checked ? { by: userName, at: new Date() } : null } : i)) })),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const all = optimistic.flatMap((g) => g.items);
  const completed = all.filter((i) => i.done).length;
  const pct = all.length ? Math.round((completed / all.length) * 100) : 0;

  function toggle(id: string, checked: boolean) {
    setError(null);
    startTransition(async () => {
      setOptimistic({ id, checked });
      const res = await toggleCheck({ itemId: id, checked });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="rounded-lg border border-line-15 bg-surface">
      {/* Sem overflow-hidden no cartão: senão a barra fixa se posiciona em relação a ele, não à tela. */}
      <div className="sticky top-16 z-10 rounded-t-lg border-b border-line bg-surface px-5 py-4 sm:px-6 lg:top-20">
        <div className="mb-2.5 flex justify-between text-[13px] font-semibold">
          <span>{pct === 100 ? "Checklist concluído" : `${completed} de ${all.length} concluídas`}</span>
          <span className="font-mono text-ink-50">{pct}%</span>
        </div>
        <Progress pct={pct} label="Progresso do checklist" />
        {error && <p role="alert" className="mt-3 text-sm font-medium text-brand-text">{error}</p>}
      </div>

      {optimistic.map((group, gi) => {
        const groupDone = group.items.every((i) => i.done);
        return (
          <fieldset key={group.name} className="border-t border-line first-of-type:border-t-0">
            <legend className="sr-only">{group.name}</legend>
            <div className="flex items-center justify-between px-5 pt-5 pb-1 sm:px-6">
              <p className="flex items-center gap-3 text-[11px] font-bold tracking-eyebrow text-ink-50 uppercase">
                <span className="font-mono tracking-normal text-ink-35">{String(gi + 1).padStart(2, "0")}</span>
                {group.name}
              </p>
              <span className={cn("font-mono text-xs", groupDone ? "font-bold text-ink" : "text-ink-35")}>
                {group.items.filter((i) => i.done).length}/{group.items.length}
              </span>
            </div>
            {group.items.map((item) => (
              <label
                key={item.id}
                className={cn("flex scroll-mt-40 scroll-mb-28 cursor-pointer items-start gap-4 px-5 py-3.5 transition-colors hover:bg-bg-alt/70 sm:px-6 lg:scroll-mt-44 lg:scroll-mb-4 last:rounded-b-lg", disabled && "pointer-events-none opacity-60")}
              >
                <input type="checkbox" className="peer sr-only" checked={!!item.done} disabled={disabled} onChange={(e) => toggle(item.id, e.target.checked)} />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-xs border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
                    item.done ? "border-ink bg-ink text-white" : "border-ink-25 bg-surface",
                  )}
                >
                  {item.done && <Check className="size-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-[15px] leading-snug font-semibold", item.done && "text-ink-50 line-through decoration-ink-35")}>{item.label}</span>
                  {item.done && (
                    <span className="mt-1 block text-[13px] text-ink-50">
                      {item.done.by} · {when(new Date(item.done.at))}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
        );
      })}
    </div>
  );
}
