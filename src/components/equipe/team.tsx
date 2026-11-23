"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createUser, resetUserPassword, setUserActive, setUserRole } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Tag } from "@/components/ui/tag";
import { FUNCOES } from "@/lib/constants";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

type Member = { id: string; name: string; email: string; role: "voluntario" | "coordenacao"; active: boolean; defaultFunction: string | null };

export function CreateUserForm() {
  const [state, action] = useActionState(createUser, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-4 p-5 sm:p-6">
      <Field label="Nome" htmlFor="u-name">
        <Input id="u-name" name="name" required maxLength={80} />
      </Field>
      <Field label="E-mail" htmlFor="u-email">
        <Input id="u-email" name="email" type="email" required />
      </Field>
      <Field label="Senha provisória" htmlFor="u-pass" hint="Mínimo de 8 caracteres. A pessoa pode trocar depois em Perfil.">
        <Input id="u-pass" name="password" type="text" required minLength={8} autoComplete="off" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Função" htmlFor="u-fn">
          <Select id="u-fn" name="defaultFunction">
            {FUNCOES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </Field>
        <Field label="Acesso" htmlFor="u-role">
          <Select id="u-role" name="role" defaultValue="voluntario">
            <option value="voluntario">Voluntário</option>
            <option value="coordenacao">Coordenação</option>
          </Select>
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Cadastrando…">Cadastrar</SubmitButton>
    </form>
  );
}

export function MemberRow({ member, isMe }: { member: Member; isMe: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetState, resetAction] = useActionState(resetUserPassword, undefined);

  const run = (fn: () => Promise<{ error?: string } | undefined>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (res?.error) setError(res.error);
    });

  return (
    <div className={cn("border-t border-line px-5 py-4 first:border-t-0 sm:px-6", !member.active && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg-alt text-[13px] font-bold">{initials(member.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
            {member.name} {isMe && <span className="text-xs font-normal text-ink-50">(você)</span>}
            {member.role === "coordenacao" && <Tag tone="brand">Coordenação</Tag>}
            {!member.active && <Tag>Desativado</Tag>}
          </p>
          <p className="truncate text-[13px] text-ink-50">
            {member.email}
            {member.defaultFunction ? ` · ${member.defaultFunction}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setUserRole(member.id, member.role === "coordenacao" ? "voluntario" : "coordenacao"))}>
            {member.role === "coordenacao" ? "Tornar voluntário" : "Tornar coordenação"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowReset((v) => !v)}>
            Senha
          </Button>
          {!isMe && (
            <Button
              size="sm"
              variant={member.active ? "danger" : "outline"}
              disabled={pending}
              onClick={() => {
                if (!member.active || confirm(`Desativar o acesso de ${member.name}?`)) run(() => setUserActive(member.id, !member.active));
              }}
            >
              {member.active ? "Desativar" : "Reativar"}
            </Button>
          )}
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-brand-text">{error}</p>}
      {showReset && (
        <form action={resetAction} className="mt-3 flex flex-wrap items-start gap-2">
          <input type="hidden" name="id" value={member.id} />
          <Input name="password" type="text" required minLength={8} placeholder="Nova senha provisória" aria-label="Nova senha provisória" className="h-11 max-w-xs text-sm" autoComplete="off" />
          <SubmitButton variant="ink" pendingText="…">
            Definir
          </SubmitButton>
          <div className="basis-full">
            <FormMessage state={resetState} />
          </div>
        </form>
      )}
    </div>
  );
}
