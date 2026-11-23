"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/app/actions/types";

/** Rótulo + campo + dica, no padrão do site. */
export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-ink-50">{hint}</p>}
    </div>
  );
}

/** Erros aparecem junto ao formulário; sucessos viram aviso rápido (toast). */
export function FormError({ state }: { state?: FormState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-medium text-brand-text">
      {state.error}
    </p>
  );
}

/** Mostra o toast de sucesso e devolve uma ref para limpar o formulário. */
export function useFormFeedback(state: FormState, { reset = true } = {}) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      toast.success(state.ok);
      if (reset) ref.current?.reset();
    }
  }, [state, reset]);
  return ref;
}
