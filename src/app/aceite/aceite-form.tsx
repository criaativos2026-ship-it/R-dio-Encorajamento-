"use client";

import { useActionState } from "react";
import { logout } from "@/app/actions/auth";
import { acceptPrivacy } from "@/app/actions/privacidade";
import { FormError } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/ui/submit-button";

export function AceiteForm() {
  const [state, action] = useActionState(acceptPrivacy, undefined);
  return (
    <div className="mt-6 grid gap-4">
      <form action={action} className="grid gap-4">
        <label htmlFor="concordo" className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <Checkbox id="concordo" name="concordo" value="on" className="mt-0.5" />
          <span className="text-[15px] leading-relaxed">
            Li o aviso de privacidade e <strong>concordo</strong> com o uso dos meus dados pelo Controle Interação, como descrito acima.
          </span>
        </label>
        <FormError state={state} />
        <SubmitButton size="lg" pendingText="Registrando…" className="w-full sm:w-auto">
          Concordo e quero continuar
        </SubmitButton>
      </form>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="sm">
          Não concordo, sair do app
        </Button>
      </form>
    </div>
  );
}
