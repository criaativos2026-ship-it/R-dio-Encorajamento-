import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("overflow-hidden rounded-lg border border-line-15 bg-surface", className)}>{children}</section>;
}

export function PanelHeader({ title, kicker, action }: { title?: ReactNode; kicker?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
      <div>
        {kicker && <p className="text-[11px] font-bold uppercase tracking-eyebrow text-brand-text">{kicker}</p>}
        {title && <h2 className="text-lg font-black tracking-display">{title}</h2>}
      </div>
      {action}
    </div>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-start gap-4 border-t border-line px-5 py-4 first:border-t-0 sm:px-6", className)}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-6 py-10 text-center text-sm text-ink-50">{children}</p>;
}
