"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserMinus } from "lucide-react";
import { createSchedule, deleteSchedule, inviteToSchedule, removeFromSchedule } from "@/app/actions/escalas";
import { ConfirmButton } from "@/components/confirm-button";
import { Field, FormError, useFormFeedback } from "@/components/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { FUNCOES } from "@/lib/constants";

const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export function CriarEscalaForm({ sugestoes, titulos, hoje }: { sugestoes: { date: string; label: string }[]; titulos: Record<number, string>; hoje: string }) {
  const [state, action] = useActionState(createSchedule, undefined);
  const ref = useFormFeedback(state);
  const [date, setDate] = useState(sugestoes[0]?.date ?? hoje);
  const wd = new Date(`${date}T12:00:00Z`).getUTCDay();
  const [title, setTitle] = useState(titulos[wd] ?? "Culto");
  const [editouTitulo, setEditouTitulo] = useState(false);

  function escolher(d: string) {
    setDate(d);
    if (!editouTitulo) setTitle(titulos[new Date(`${d}T12:00:00Z`).getUTCDay()] ?? "Culto");
  }

  return (
    <form ref={ref} action={action} className="grid gap-4 p-5 sm:p-6">
      <div className="grid gap-2.5">
        <p className="text-[11px] font-bold tracking-[0.15em] text-ink-50 uppercase">Próximos cultos</p>
        <div className="flex flex-wrap gap-2">
          {sugestoes.map((s) => (
            <button
              key={s.date}
              type="button"
              onClick={() => escolher(s.date)}
              className={`rounded-xl border px-3 py-2 text-[13px] font-bold transition-colors ${date === s.date ? "border-ink bg-ink text-white" : "border-input hover:border-ink-35"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <Field label="Data" htmlFor="e-date" hint={`Cai num(a) ${DIAS[wd]}.`}>
        <Input id="e-date" name="date" type="date" min={hoje} value={date} onChange={(e) => escolher(e.target.value)} required />
      </Field>
      <Field label="Culto" htmlFor="e-title">
        <Input
          id="e-title"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setEditouTitulo(true);
          }}
          required
          maxLength={80}
        />
      </Field>
      <Field label="Observação (opcional)" htmlFor="e-notes">
        <Textarea id="e-notes" name="notes" maxLength={500} placeholder="Ex.: chegada às 17h30" className="min-h-20" />
      </Field>
      <FormError state={state} />
      <SubmitButton pendingText="Criando…">Criar escala</SubmitButton>
    </form>
  );
}

export function ConvidarForm({ scheduleId, pessoas }: { scheduleId: string; pessoas: { id: string; name: string; defaultFunction: string | null }[] }) {
  const [state, action] = useActionState(inviteToSchedule, undefined);
  const ref = useFormFeedback(state);
  const [fn, setFn] = useState<string>(FUNCOES[0]);
  return (
    <form ref={ref} action={action} className="grid gap-4 p-5 sm:p-6">
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <Field label="Pessoa" htmlFor="c-user">
        <NativeSelect
          id="c-user"
          name="userId"
          defaultValue=""
          required
          onChange={(e) => {
            const p = pessoas.find((x) => x.id === e.target.value);
            if (p?.defaultFunction && (FUNCOES as readonly string[]).includes(p.defaultFunction)) setFn(p.defaultFunction);
          }}
        >
          <option value="" disabled>
            Escolha uma pessoa
          </option>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Função" htmlFor="c-fn">
        <NativeSelect id="c-fn" name="function" value={fn} onChange={(e) => setFn(e.target.value)}>
          {FUNCOES.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </NativeSelect>
      </Field>
      <FormError state={state} />
      <SubmitButton pendingText="Convidando…">Convidar</SubmitButton>
    </form>
  );
}

export function RetirarDaEscala({ slotId, name }: { slotId: string; name: string }) {
  return (
    <ConfirmButton
      variant="ghost"
      size="icon"
      aria-label={`Retirar ${name}`}
      title={`Retirar ${name} da escala?`}
      description="O convite é apagado. Se o culto já estiver aberto, a pessoa sai da escala do dia."
      confirmLabel="Retirar"
      successMessage="Pessoa retirada da escala."
      onConfirm={() => removeFromSchedule(slotId)}
    >
      <UserMinus />
    </ConfirmButton>
  );
}

export function ExcluirEscala({ scheduleId }: { scheduleId: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      variant="destructive"
      title="Excluir esta escala?"
      description="Todos os convites e respostas desta escala serão apagados."
      confirmLabel="Excluir escala"
      successMessage="Escala excluída."
      onConfirm={async () => {
        const res = await deleteSchedule(scheduleId);
        router.push("/gestao/escalas");
        return res;
      }}
    >
      <Trash2 className="size-3.5" /> Excluir escala
    </ConfirmButton>
  );
}
