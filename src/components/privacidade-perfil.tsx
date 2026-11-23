"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { Download, FileText, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { cancelDeletion, changeOwnEmail, requestDeletion } from "@/app/actions/privacidade";
import { ConfirmButton } from "@/components/confirm-button";
import { Field, FormError, useFormFeedback } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { when } from "@/lib/format";

export function MeusDadosPrivacidade({ acceptedAt, version, deletionRequestedAt }: { acceptedAt: Date | null; version: string | null; deletionRequestedAt: Date | null }) {
  const [state, action] = useActionState(changeOwnEmail, undefined);
  const ref = useFormFeedback(state);
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-6 p-5 sm:p-6">
      <div className="grid gap-2 text-sm">
        <p className="text-muted-foreground">
          Você aceitou o aviso de privacidade {acceptedAt ? when(new Date(acceptedAt)).toLowerCase() : "—"} (versão {version ?? "—"}).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/privacidade">
              <FileText className="size-3.5" /> Ler o aviso de privacidade
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            {/* Download direto: o navegador salva o arquivo JSON com todos os seus dados */}
            <a href="/api/meus-dados" download>
              <Download className="size-3.5" /> Baixar meus dados
            </a>
          </Button>
        </div>
      </div>

      <form ref={ref} action={action} className="grid gap-4 border-t border-line pt-5">
        <p className="text-sm font-bold">Trocar e-mail de acesso</p>
        <Field label="Novo e-mail" htmlFor="pv-email">
          <Input id="pv-email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Sua senha" htmlFor="pv-pass" hint="Para confirmar que é você.">
          <Input id="pv-pass" name="password" type="password" required autoComplete="current-password" />
        </Field>
        <FormError state={state} />
        <SubmitButton variant="ink">Trocar e-mail</SubmitButton>
      </form>

      <div className="grid gap-3 border-t border-line pt-5">
        <p className="text-sm font-bold">Excluir meus dados</p>
        {deletionRequestedAt ? (
          <>
            <p className="rounded-xl bg-primary/10 px-3 py-2.5 text-sm text-brand-text">
              Pedido de exclusão enviado {when(new Date(deletionRequestedAt)).toLowerCase()}. A gestão da equipe vai concluir a exclusão.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="justify-self-start"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await cancelDeletion();
                  toast.success("Pedido de exclusão cancelado.");
                })
              }
            >
              <Undo2 className="size-3.5" /> Cancelar pedido
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              A gestão apaga o seu nome, e-mail e acesso. Nos registros antigos dos cultos você passa a aparecer como “Pessoa removida”. Antes, se quiser, baixe uma cópia dos seus dados.
            </p>
            <ConfirmButton
              variant="destructive"
              className="justify-self-start"
              title="Pedir a exclusão dos seus dados?"
              description="A gestão será avisada e fará a exclusão. Depois disso você não conseguirá mais entrar no app. Você pode cancelar o pedido enquanto ele não for concluído."
              confirmLabel="Pedir exclusão"
              successMessage="Pedido de exclusão enviado à gestão."
              onConfirm={requestDeletion}
            >
              <Trash2 className="size-3.5" /> Pedir exclusão
            </ConfirmButton>
          </>
        )}
      </div>
    </div>
  );
}
