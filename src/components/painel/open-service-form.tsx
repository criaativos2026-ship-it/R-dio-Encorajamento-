"use client";

import { useActionState } from "react";
import { openService } from "@/app/actions/service";
import { Field, FormMessage, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FUNCOES } from "@/lib/constants";

export function OpenServiceForm({ today, defaultFunction }: { today: string; defaultFunction: string }) {
  const [state, action] = useActionState(openService, undefined);
  return (
    <form action={action} className="grid gap-4 rounded-lg bg-surface p-5 text-ink sm:p-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-eyebrow text-brand-text">Abrir culto</p>
        <p className="mt-1 text-sm text-muted">Os checklists e a escala ficam ligados a este culto.</p>
      </div>
      <Field label="Culto" htmlFor="title">
        <Input id="title" name="title" defaultValue="Culto" required maxLength={80} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data" htmlFor="date">
          <Input id="date" name="date" type="date" defaultValue={today} required />
        </Field>
        <Field label="Horário" htmlFor="time">
          <Input id="time" name="time" type="time" />
        </Field>
      </div>
      <Field label="Sua função" htmlFor="function">
        <Select id="function" name="function" defaultValue={defaultFunction}>
          {FUNCOES.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </Select>
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Abrindo…">Abrir culto</SubmitButton>
    </form>
  );
}
