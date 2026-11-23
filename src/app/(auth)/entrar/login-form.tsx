"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-8 grid gap-5">
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus={!state?.email} defaultValue={state?.email} key={state?.email} />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus={!!state?.email} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton size="lg" pendingText="Entrando…" className="w-full">
        Entrar
      </SubmitButton>
      <p className="text-center text-xs text-ink-50">Esqueceu a senha? Fale com a coordenação da equipe.</p>
    </form>
  );
}
