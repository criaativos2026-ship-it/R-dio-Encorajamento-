"use client";

import { useActionState } from "react";
import { joinRoster, leaveRoster } from "@/app/actions/service";
import { Button } from "@/components/ui/button";
import { FormMessage, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FUNCOES } from "@/lib/constants";

export function JoinRoster({ defaultFunction }: { defaultFunction: string }) {
  const [state, action] = useActionState(joinRoster, undefined);
  return (
    <form action={action} className="grid gap-3 border-t border-line px-5 py-4 sm:px-6">
      <p className="text-sm font-semibold">Vai servir neste culto?</p>
      <div className="flex gap-2">
        <Select name="function" defaultValue={defaultFunction} aria-label="Função" className="h-11 text-sm">
          {FUNCOES.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </Select>
        <SubmitButton pendingText="…">Entrar</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function LeaveRoster() {
  return (
    <form action={leaveRoster}>
      <Button type="submit" variant="ghost" size="sm">
        Sair da escala
      </Button>
    </form>
  );
}
