import Link from "next/link";
import { notFound } from "next/navigation";
import { Info, Pencil } from "lucide-react";
import { ChecklistView } from "@/components/checklist/checklist-view";
import { ResetChecklistButton } from "@/components/checklist/reset-button";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/heading";
import { CHECKLIST_AVISO, CHECKLIST_LABEL } from "@/lib/constants";
import { serviceDate } from "@/lib/format";
import { getActiveService, getChecklist } from "@/lib/queries";
import { isCoordenacao, requireUser } from "@/lib/session";

const KINDS = ["montagem", "desmontagem"] as const;
type Kind = (typeof KINDS)[number];

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  return { title: KINDS.includes(tipo as Kind) ? `Checklist de ${CHECKLIST_LABEL[tipo as Kind].toLowerCase()}` : "Checklist" };
}

export default async function ChecklistPage({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  if (!KINDS.includes(tipo as Kind)) notFound();
  const kind = tipo as Kind;
  const label = CHECKLIST_LABEL[kind];

  const user = await requireUser();
  const service = await getActiveService();
  const checklist = await getChecklist(kind, service?.id ?? null);
  const aviso = CHECKLIST_AVISO[kind];
  const coord = isCoordenacao(user);

  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeader
        kicker={service ? `${serviceDate(service.date)} · ${service.title}` : "Checklist"}
        title={`Checklist de ${label.toLowerCase()}`}
        description={kind === "montagem" ? "Preparação da rádio antes do culto." : "Encerramento e organização do espaço depois do culto."}
        actions={
          coord ? (
            <>
              {service && checklist.completed > 0 && <ResetChecklistButton kind={kind} label={label} />}
              <Button asChild variant="outline" size="sm">
<Link href="/equipe#checklists">
        <Pencil className="size-3.5" /> Editar itens
       </Link>
</Button>
            </>
          ) : undefined
        }
      />

      {aviso && (
        <div className="mb-6 flex gap-4 rounded-2xl border border-brand/40 bg-brand/[0.06] p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-brand-text" />
          <div>
            <p className="text-[11px] font-bold tracking-eyebrow text-brand-text uppercase">Importante</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{aviso}</p>
          </div>
        </div>
      )}

      {!service && (
        <div className="mb-6 rounded-2xl border border-line-15 bg-surface p-5 text-[15px]">
          Nenhum culto aberto. <Link href="/" className="font-semibold text-brand-text underline-offset-4 hover:underline">Abra o culto no painel</Link> para marcar os itens.
        </div>
      )}

      {checklist.total === 0 ? (
        <p className="rounded-2xl border border-line-15 bg-surface p-10 text-center text-sm text-ink-50">Nenhum item cadastrado neste checklist.</p>
      ) : (
        <ChecklistView groups={checklist.groups} userName={user.name} disabled={!service} />
      )}
    </main>
  );
}
