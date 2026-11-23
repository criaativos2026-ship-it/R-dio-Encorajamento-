"use client";

import { useActionState, useState } from "react";
import { ChevronDown, Pin, PinOff, Trash2 } from "lucide-react";
import { createNotice, createProblem, deleteNotice, resolveProblem, togglePinNotice } from "@/app/actions/central";
import { ConfirmButton } from "@/components/confirm-button";
import { Field, FormError, useFormFeedback } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export function ProblemForm() {
  const [state, action] = useActionState(createProblem, undefined);
  const ref = useFormFeedback(state);
  return (
    <form ref={ref} action={action} className="grid gap-4 p-5 sm:p-6">
      <Field label="O que aconteceu?" htmlFor="p-title">
        <Input id="p-title" name="title" required maxLength={100} placeholder="Ex.: microfone vermelho sem sinal" />
      </Field>
      <Field label="Detalhes" htmlFor="p-desc">
        <Textarea id="p-desc" name="description" maxLength={1000} placeholder="Onde, quando, o que já foi tentado" />
      </Field>
      <Field label="Prioridade" htmlFor="p-sev">
        <NativeSelect id="p-sev" name="severity" defaultValue="media">
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta: impede a transmissão</option>
        </NativeSelect>
      </Field>
      <FormError state={state} />
      <SubmitButton pendingText="Registrando…">Registrar problema</SubmitButton>
    </form>
  );
}

export function ResolveForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(resolveProblem, undefined);
  useFormFeedback(state);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm">
          Marcar como resolvido <ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <form action={action} className="mt-3 grid gap-3">
          <input type="hidden" name="id" value={id} />
          <Textarea name="note" maxLength={500} placeholder="Como foi resolvido? (opcional)" className="min-h-20 text-sm" aria-label="Como foi resolvido" />
          <FormError state={state} />
          <SubmitButton variant="ink" size="sm" pendingText="Salvando…" className="justify-self-start">
            Confirmar resolução
          </SubmitButton>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function NoticeForm() {
  const [state, action] = useActionState(createNotice, undefined);
  const ref = useFormFeedback(state);
  return (
    <form ref={ref} action={action} className="grid gap-4 p-5 sm:p-6">
      <Field label="Título" htmlFor="n-title">
        <Input id="n-title" name="title" required maxLength={100} />
      </Field>
      <Field label="Mensagem" htmlFor="n-body">
        <Textarea id="n-body" name="body" required maxLength={2000} />
      </Field>
      <div className="flex items-center gap-3">
        <Checkbox id="n-pinned" name="pinned" value="on" />
        <Label htmlFor="n-pinned" className="text-sm font-medium tracking-normal text-ink normal-case">
          Fixar no topo
        </Label>
      </div>
      <FormError state={state} />
      <SubmitButton pendingText="Publicando…">Publicar comunicado</SubmitButton>
    </form>
  );
}

export function NoticeActions({ id, pinned }: { id: string; pinned: boolean }) {
  return (
    <div className="flex shrink-0 gap-1">
      <form action={togglePinNotice.bind(null, id)}>
        <Button type="submit" variant="ghost" size="icon" title={pinned ? "Desafixar" : "Fixar no topo"} aria-label={pinned ? "Desafixar" : "Fixar no topo"}>
          {pinned ? <PinOff /> : <Pin />}
        </Button>
      </form>
      <ConfirmButton
        variant="ghost"
        size="icon"
        aria-label="Remover"
        title="Remover este comunicado?"
        description="Ele sai do mural para toda a equipe."
        confirmLabel="Remover"
        successMessage="Comunicado removido."
        onConfirm={() => deleteNotice(id)}
      >
        <Trash2 />
      </ConfirmButton>
    </div>
  );
}
