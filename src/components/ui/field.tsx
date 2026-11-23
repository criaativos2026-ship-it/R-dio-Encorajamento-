import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-2xl border border-line-15 bg-surface px-4 text-[15px] text-ink placeholder:text-ink-35 transition-colors focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15";

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-50">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-50">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-[52px]", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 resize-y py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "h-[52px] appearance-none bg-[url(/chevron.svg)] bg-[length:16px] bg-[right_16px_center] bg-no-repeat pr-10", className)} {...props} />;
}

export function FormMessage({ state }: { state?: { error?: string; ok?: string } }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p role={state.error ? "alert" : "status"} className={cn("rounded-xl px-3 py-2.5 text-sm font-medium", state.error ? "bg-brand/10 text-brand-text" : "bg-bg-alt text-ink")}>
      {state.error ?? state.ok}
    </p>
  );
}
