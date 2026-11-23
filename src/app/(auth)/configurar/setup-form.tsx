"use client";

import { useActionState } from "react";
import { setupFirstUser } from "@/app/actions/auth";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function SetupForm() {
  const [state, action] = useActionState(setupFirstUser, undefined);
  return (
    <form action={action} className="mt-8 grid gap-5">
      <Field label="Nome" htmlFor="name">
        <Input id="name" name="name" autoComplete="name" required maxLength={80} />
      </Field>
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Senha" htmlFor="password" hint="Mínimo de 8 caracteres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton size="lg" pendingText="Criando…" className="w-full">
        Criar conta e entrar
      </SubmitButton>
    </form>
  );
}
