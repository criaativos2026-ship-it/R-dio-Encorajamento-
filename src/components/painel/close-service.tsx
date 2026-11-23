"use client";

import { closeService } from "@/app/actions/service";
import { ConfirmButton } from "@/components/confirm-button";

export function CloseServiceButton({ pending }: { pending: number }) {
  return (
    <ConfirmButton
      variant="outlineLight"
      size="lg"
      title="Encerrar o culto?"
      description={pending > 0 ? `Ainda há ${pending} etapa(s) pendente(s) nos checklists. O culto será encerrado mesmo assim.` : "Os checklists deste culto ficam salvos no histórico."}
      confirmLabel="Encerrar culto"
      successMessage="Culto encerrado."
      onConfirm={closeService}
    >
      Encerrar culto
    </ConfirmButton>
  );
}
