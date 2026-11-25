"use client";

import { useActionState, useState } from "react";
import { Check, X } from "lucide-react";
import { respondToSchedule } from "@/app/actions/escalas";
import { FormError, useFormFeedback } from "@/components/form";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

/** Aceitar ou recusar a própria escala (recusa com motivo opcional). */
export function ResponderEscala({ slotId, status }: { slotId: string; status: "pendente" | "aceita" | "recusada" }) {
  const [state, action] = useActionState(respondToSchedule, undefined);
  useFormFeedback(state, { reset: false });
  const [recusando, setRecusando] = useState(false);

  if (recusando)
    return (
      <form action={action} className="mt-3 grid gap-3">
        <input type="hidden" name="slotId" value={slotId} />
        <input type="hidden" name="answer" value="recusar" />
        <Textarea name="note" maxLength={300} placeholder="Motivo (opcional). Ex.: estarei viajando" className="min-h-20 text-sm" aria-label="Motivo da recusa" />
        <FormError state={state} />
        <div className="flex flex-wrap gap-2">
          <SubmitButton variant="ink" size="sm" pendingText="Enviando…">
            Confirmar recusa
          </SubmitButton>
          <Button type="button" variant="ghost" size="sm" onClick={() => setRecusando(false)}>
            Voltar
          </Button>
        </div>
      </form>
    );

  return (
    <div className="mt-3 grid gap-2">
      <div className="flex flex-wrap gap-2">
        {status !== "aceita" && (
          <form action={action}>
            <input type="hidden" name="slotId" value={slotId} />
            <input type="hidden" name="answer" value="aceitar" />
            <SubmitButton size="sm" pendingText="Enviando…">
              <Check /> Aceitar
            </SubmitButton>
          </form>
        )}
        {status !== "recusada" && (
          <Button type="button" variant="outline" size="sm" onClick={() => setRecusando(true)}>
            <X /> Recusar
          </Button>
        )}
      </div>
      <FormError state={state} />
    </div>
  );
}
