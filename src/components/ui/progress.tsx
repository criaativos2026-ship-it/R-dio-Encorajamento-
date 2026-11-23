import { cn } from "@/lib/cn";

/** Laranja enquanto em andamento; preto-grafite quando concluído (padrão aprovado). */
export function Progress({ pct, className, label }: { pct: number; className?: string; label?: string }) {
  const done = pct >= 100;
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label} className={cn("h-1.5 overflow-hidden rounded-full bg-bg-alt", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", done ? "bg-ink" : "bg-brand")} style={{ width: `${pct}%` }} />
    </div>
  );
}
