"use client";

import { useActionState, useEffect, useRef } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { createNotice, createProblem, deleteNotice, resolveProblem, togglePinNotice } from "@/app/actions/central";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

function useResetOnSuccess(state: { ok?: string } | undefined) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function ProblemForm() {
  const [state, action] = useActionState(createProblem, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="grid gap-4 p-5 sm:p-6">
      <Field label="O que aconteceu?" htmlFor="p-title">
        <Input id="p-title" name="title" required maxLength={100} placeholder="Ex.: microfone vermelho sem sinal" />
      </Field>
      <Field label="Detalhes" htmlFor="p-desc">
        <Textarea id="p-desc" name="description" maxLength={1000} placeholder="Onde, quando, o que já foi tentado" />
      </Field>
      <Field label="Prioridade" htmlFor="p-sev">
        <Select id="p-sev" name="severity" defaultValue="media">
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta: impede a transmissão</option>
        </Select>
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Registrando…">Registrar problema</SubmitButton>
    </form>
  );
}

export function ResolveForm({ id }: { id: string }) {
  const [state, action] = useActionState(resolveProblem, undefined);
  return (
    <details className="group mt-3">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-2xl border border-line-15 px-3.5 text-[13px] font-bold transition-colors hover:border-ink-35 [&::-webkit-details-marker]:hidden">
        Marcar como resolvido
      </summary>
      <form action={action} className="mt-3 grid gap-3">
        <input type="hidden" name="id" value={id} />
        <Textarea name="note" maxLength={500} placeholder="Como foi resolvido? (opcional)" className="min-h-20 text-sm" aria-label="Como foi resolvido" />
        <FormMessage state={state} />
        <SubmitButton variant="ink" size="sm" pendingText="Salvando…" className="justify-self-start">
          Confirmar resolução
        </SubmitButton>
      </form>
    </details>
  );
}

export function NoticeForm() {
  const [state, action] = useActionState(createNotice, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="grid gap-4 p-5 sm:p-6">
      <Field label="Título" htmlFor="n-title">
        <Input id="n-title" name="title" required maxLength={100} />
      </Field>
      <Field label="Mensagem" htmlFor="n-body">
        <Textarea id="n-body" name="body" required maxLength={2000} />
      </Field>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" name="pinned" className="size-4 accent-[#1D1D1B]" /> Fixar no topo
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingText="Publicando…">Publicar comunicado</SubmitButton>
    </form>
  );
}

export function NoticeActions({ id, pinned }: { id: string; pinned: boolean }) {
  return (
    <div className="flex shrink-0 gap-1">
      <form action={togglePinNotice.bind(null, id)}>
        <Button type="submit" variant="ghost" size="sm" title={pinned ? "Desafixar" : "Fixar no topo"} aria-label={pinned ? "Desafixar" : "Fixar no topo"}>
          {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </Button>
      </form>
      <form
        action={deleteNotice.bind(null, id)}
        onSubmit={(e) => {
          if (!confirm("Remover este comunicado?")) e.preventDefault();
        }}
      >
        <Button type="submit" variant="ghost" size="sm" title="Remover" aria-label="Remover">
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  );
}
