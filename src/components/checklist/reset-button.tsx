"use client";

import { RotateCcw } from "lucide-react";
import { resetChecklist } from "@/app/actions/checklist";
import { Button } from "@/components/ui/button";

export function ResetChecklistButton({ kind, label }: { kind: "montagem" | "desmontagem"; label: string }) {
  return (
    <form
      action={resetChecklist.bind(null, kind)}
      onSubmit={(e) => {
        if (!confirm(`Desmarcar todos os itens do checklist de ${label.toLowerCase()} neste culto?`)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        <RotateCcw className="size-3.5" /> Reiniciar
      </Button>
    </form>
  );
}
