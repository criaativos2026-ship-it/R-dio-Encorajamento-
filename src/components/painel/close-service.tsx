"use client";

import { closeService } from "@/app/actions/service";
import { Button } from "@/components/ui/button";

export function CloseServiceButton({ pending }: { pending: number }) {
  return (
    <form
      action={closeService}
      onSubmit={(e) => {
        const msg = pending > 0 ? `Ainda há ${pending} etapa(s) pendente(s). Encerrar o culto mesmo assim?` : "Encerrar este culto?";
        if (!confirm(msg)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="outline-light">
        Encerrar culto
      </Button>
    </form>
  );
}
