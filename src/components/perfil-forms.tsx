"use client";

import { useActionState } from "react";
import { changeOwnPassword, updateOwnProfile } from "@/app/actions/team";
import { Field, FormMessage, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FUNCOES } from "@/lib/constants";

export function ProfileForm({ name, defaultFunction }: { name: string; defaultFunction: string }) {
  const [state, action] = useActionState(updateOwnProfile, undefined);
  return (
    <form action={action} className="grid gap-4 p-5 sm:p-6">
      <Field label="Nome" htmlFor="pf-name">
        <Input id="pf-name" name="name" defaultValue={name} required maxLength={80} />
      </Field>
      <Field label="Função principal" htmlFor="pf-fn">
        <Select id="pf-fn" name="defaultFunction" defaultValue={defaultFunction}>
          {FUNCOES.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </Select>
      </Field>
      <FormMessage state={state} />
      <SubmitButton>Salvar</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changeOwnPassword, undefined);
  return (
    <form action={action} className="grid gap-4 p-5 sm:p-6">
      <Field label="Senha atual" htmlFor="pw-cur">
        <Input id="pw-cur" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Nova senha" htmlFor="pw-new" hint="Mínimo de 8 caracteres.">
        <Input id="pw-new" name="next" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <Field label="Confirmar nova senha" htmlFor="pw-conf">
        <Input id="pw-conf" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton variant="ink">Alterar senha</SubmitButton>
    </form>
  );
}
