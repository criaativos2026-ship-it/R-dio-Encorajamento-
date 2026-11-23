"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { createUser, resetUserPassword, setUserActive, setUserRole } from "@/app/actions/team";
import { ConfirmButton } from "@/components/confirm-button";
import { Field, FormError, useFormFeedback } from "@/components/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FUNCOES } from "@/lib/constants";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type Member = { id: string; name: string; email: string; role: "voluntario" | "coordenacao"; active: boolean; defaultFunction: string | null };

export function CreateUserForm() {
  const [state, action] = useActionState(createUser, undefined);
  const ref = useFormFeedback(state);
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
          <NativeSelect id="u-fn" name="defaultFunction">
            {FUNCOES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Acesso" htmlFor="u-role">
          <NativeSelect id="u-role" name="role" defaultValue="voluntario">
            <option value="voluntario">Voluntário</option>
            <option value="coordenacao">Coordenação</option>
          </NativeSelect>
        </Field>
      </div>
      <FormError state={state} />
      <SubmitButton pendingText="Cadastrando…">Cadastrar</SubmitButton>
    </form>
  );
}

function ResetPassword({ id }: { id: string }) {
  const [state, action] = useActionState(resetUserPassword, undefined);
  const ref = useFormFeedback(state);
  return (
    <form ref={ref} action={action} className="mt-3 flex flex-wrap items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <Input name="password" type="text" required minLength={8} placeholder="Nova senha provisória" aria-label="Nova senha provisória" className="h-11 max-w-xs text-sm" autoComplete="off" />
      <SubmitButton variant="ink" pendingText="…">
        Definir
      </SubmitButton>
      <div className="basis-full">
        <FormError state={state} />
      </div>
    </form>
  );
}

export function MemberRow({ member, isMe }: { member: Member; isMe: boolean }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const toggleRole = () =>
    start(async () => {
      const res = await setUserRole(member.id, member.role === "coordenacao" ? "voluntario" : "coordenacao");
      if (res?.error) toast.error(res.error);
      else toast.success("Acesso atualizado.");
    });

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn("border-t border-line px-5 py-4 first:border-t-0 sm:px-6", !member.active && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar>
          <AvatarFallback>{initials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
            {member.name} {isMe && <span className="text-xs font-normal text-ink-50">(você)</span>}
            {member.role === "coordenacao" && <Badge variant="brand">Coordenação</Badge>}
            {!member.active && <Badge variant="outline">Desativado</Badge>}
          </p>
          <p className="truncate text-[13px] text-ink-50">
            {member.email}
            {member.defaultFunction ? ` · ${member.defaultFunction}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" disabled={pending} onClick={toggleRole}>
            {member.role === "coordenacao" ? "Tornar voluntário" : "Tornar coordenação"}
          </Button>
          <CollapsibleTrigger asChild>
            <Button size="sm" variant="outline">
              Senha
            </Button>
          </CollapsibleTrigger>
          {!isMe &&
            (member.active ? (
              <ConfirmButton
                variant="destructive"
                title={`Desativar o acesso de ${member.name}?`}
                description="A pessoa sai do app na hora. O histórico dela continua salvo e você pode reativar quando quiser."
                confirmLabel="Desativar"
                successMessage="Acesso desativado."
                onConfirm={() => setUserActive(member.id, false)}
              >
                Desativar
              </ConfirmButton>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await setUserActive(member.id, true);
                    if (res?.error) toast.error(res.error);
                    else toast.success("Acesso reativado.");
                  })
                }
              >
                Reativar
              </Button>
            ))}
        </div>
      </div>
      <CollapsibleContent>
        <ResetPassword id={member.id} />
      </CollapsibleContent>
    </Collapsible>
  );
}
