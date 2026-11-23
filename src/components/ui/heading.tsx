import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Rótulo com traço laranja, como no topo do site ("—— SÃO CARLOS — SP"). */
export function Eyebrow({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-eyebrow", light ? "text-white/60" : "text-ink-50", className)}>
      <span aria-hidden className="h-px w-8 shrink-0 bg-brand" />
      {children}
    </p>
  );
}

/** Cabeçalho de página: rótulo laranja + título 900 (padrão "FIQUE POR DENTRO / Programação"). */
export function PageHeader({ kicker, title, description, actions }: { kicker?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {kicker && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-text sm:tracking-eyebrow">{kicker}</p>}
        <h1 className="mt-2 text-[34px] leading-[1.05] font-black tracking-display sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Palavra em destaque laranja dentro de um título. */
export function Hl({ children }: { children: ReactNode }) {
  return <em className="not-italic text-brand-text">{children}</em>;
}
