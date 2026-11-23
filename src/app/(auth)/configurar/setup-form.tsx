"use client";

import { useActionState } from "react";
import { setupFirstUser } from "@/app/actions/auth";
import { Field, FormError } from "@/components/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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
      <Field label="Seu perfil" htmlFor="role">
        <NativeSelect id="role" name="role" defaultValue="coordenacao">
          <option value="pastor">Pastor(a)</option>
          <option value="lider">Líder</option>
          <option value="coordenacao">Coordenação</option>
        </NativeSelect>
      </Field>
      <Field label="Senha" htmlFor="password" hint="Mínimo de 8 caracteres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <FormError state={state} />
      <SubmitButton size="lg" pendingText="Criando…" className="w-full">
        Criar conta e entrar
      </SubmitButton>
    </form>
  );
}
