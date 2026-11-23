"use client";

import { RotateCcw } from "lucide-react";
import { resetChecklist } from "@/app/actions/checklist";
import { ConfirmButton } from "@/components/confirm-button";

export function ResetChecklistButton({ kind, label }: { kind: "montagem" | "desmontagem"; label: string }) {
  return (
    <ConfirmButton
      title={`Reiniciar a ${label.toLowerCase()}?`}
      description="Todos os itens marcados neste culto serão desmarcados. O registro continua no histórico."
      confirmLabel="Reiniciar"
      successMessage="Checklist reiniciado."
      onConfirm={() => resetChecklist(kind)}
    >
      <RotateCcw className="size-3.5" /> Reiniciar
    </ConfirmButton>
  );
}
