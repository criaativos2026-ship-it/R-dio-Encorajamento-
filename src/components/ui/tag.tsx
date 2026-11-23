import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "border-ink-25 text-ink-50",
  brand: "border-brand/40 bg-brand/[0.08] text-brand-text",
  done: "border-ink-25 bg-bg-alt text-ink",
  solid: "border-brand bg-brand text-white",
} as const;

export function Tag({ tone = "neutral", dot, children, className }: { tone?: keyof typeof tones; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.15em]", tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
