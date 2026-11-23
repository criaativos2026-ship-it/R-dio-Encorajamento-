"use client";

import { useActionState } from "react";
import { Clock } from "lucide-react";
import { openService } from "@/app/actions/service";
import { Field, FormError } from "@/components/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FUNCOES } from "@/lib/constants";

export function OpenServiceForm({ nowLabel, defaultFunction }: { nowLabel: string; defaultFunction: string }) {
  const [state, action] = useActionState(openService, undefined);
  return (
    <Card className="border-0">
      <CardContent className="sm:p-6">
        <form action={action} className="grid gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-eyebrow text-brand-text uppercase">Abrir culto</p>
            <p className="mt-1 text-sm text-muted-foreground">Os checklists e a escala ficam ligados a este culto.</p>
          </div>
          <Field label="Culto" htmlFor="title">
            <Input id="title" name="title" defaultValue="Culto" required maxLength={80} />
          </Field>
          <div className="flex items-start gap-3 rounded-xl bg-muted px-4 py-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-ink-50" />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              <strong className="text-ink">{nowLabel}</strong>
              <br />
              Data e horário são registrados automaticamente pelo sistema no momento da abertura.
            </p>
          </div>
          <Field label="Sua função" htmlFor="function">
            <NativeSelect id="function" name="function" defaultValue={defaultFunction}>
              {FUNCOES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </NativeSelect>
          </Field>
          <FormError state={state} />
          <SubmitButton pendingText="Abrindo…">Abrir culto</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
