"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { addChecklistItem, moveChecklistItem, removeChecklistItem } from "@/app/actions/checklist";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

type Group = { name: string; items: { id: string; label: string }[] };

export function ChecklistEditor({ kind, groups }: { kind: "montagem" | "desmontagem"; groups: Group[] }) {
  const [pending, start] = useTransition();
  const [state, action] = useActionState(addChecklistItem, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    // Após adicionar, limpa o campo e mantém o foco para cadastrar o próximo item.
    const input = ref.current?.elements.namedItem("label") as HTMLInputElement | null;
    if (state?.ok && input) {
      input.value = "";
      input.focus();
    }
  }, [state]);

  return (
    <div>
      {groups.map((g) => (
        <div key={g.name} className="border-t border-line first:border-t-0">
          <p className="px-5 pt-4 pb-1 text-[11px] font-bold tracking-eyebrow text-ink-50 uppercase sm:px-6">{g.name}</p>
          {g.items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 px-5 py-2 sm:px-6">
              <p className="flex-1 text-sm">{item.label}</p>
              <Button size="sm" variant="ghost" disabled={pending || i === 0} aria-label="Subir" onClick={() => start(() => moveChecklistItem(item.id, "up"))}>
                <ArrowUp className="size-4" />
              </Button>
              <Button size="sm" variant="ghost" disabled={pending || i === g.items.length - 1} aria-label="Descer" onClick={() => start(() => moveChecklistItem(item.id, "down"))}>
                <ArrowDown className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                aria-label="Remover"
                onClick={() => {
                  if (confirm(`Remover "${item.label}"?`)) start(() => removeChecklistItem(item.id));
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ))}
      <form ref={ref} action={action} className="grid gap-3 border-t border-line bg-bg-alt/50 p-5 sm:grid-cols-[180px_1fr_auto] sm:items-end sm:p-6">
        <input type="hidden" name="kind" value={kind} />
        <Field label="Grupo" htmlFor={`${kind}-group`}>
          <Input id={`${kind}-group`} name="group" list={`${kind}-groups`} required defaultValue={groups.at(-1)?.name} className="h-11 text-sm" />
        </Field>
        <datalist id={`${kind}-groups`}>
          {groups.map((g) => (
            <option key={g.name} value={g.name} />
          ))}
        </datalist>
        <Field label="Novo item" htmlFor={`${kind}-label`}>
          <Input id={`${kind}-label`} name="label" required maxLength={140} className="h-11 text-sm" />
        </Field>
        <SubmitButton pendingText="…" className="h-11">
          Adicionar
        </SubmitButton>
        <div className="sm:col-span-3">
          <FormMessage state={state?.error ? state : undefined} />
        </div>
      </form>
    </div>
  );
}
