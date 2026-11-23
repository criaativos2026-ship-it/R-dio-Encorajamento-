import { Check, CheckCheck, Megaphone, Radio, Settings2, TriangleAlert, Undo2, UserPlus } from "lucide-react";
import type { ActivityType } from "@/db/schema";
import { Empty, Row } from "@/components/ui/panel";
import { cn } from "@/lib/cn";
import { when } from "@/lib/format";

const ICONS: Record<ActivityType, { icon: typeof Check; tone: "done" | "solid" | "brand" | "neutral" }> = {
  check: { icon: Check, tone: "done" },
  checklist_concluido: { icon: CheckCheck, tone: "solid" },
  resolvido: { icon: Check, tone: "done" },
  uncheck: { icon: Undo2, tone: "neutral" },
  problema: { icon: TriangleAlert, tone: "brand" },
  comunicado: { icon: Megaphone, tone: "neutral" },
  culto: { icon: Radio, tone: "neutral" },
  escala: { icon: UserPlus, tone: "neutral" },
  sistema: { icon: Settings2, tone: "neutral" },
};

const toneClass = {
  done: "bg-bg-alt text-ink",
  solid: "bg-ink text-white",
  brand: "bg-brand/10 text-brand-text",
  neutral: "bg-bg-alt text-ink-50",
};

export type ActivityItem = { id: string; type: ActivityType; message: string; createdAt: Date; user: string | null };

export function ActivityList({ items, empty = "Nenhuma atividade ainda." }: { items: ActivityItem[]; empty?: string }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <div>
      {items.map((a) => {
        const { icon: Icon, tone } = ICONS[a.type];
        return (
          <Row key={a.id}>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", toneClass[tone])}>
              <Icon className="size-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">{a.message}</p>
              <p className="mt-0.5 text-[13px] text-ink-50">
                {a.user ?? "Sistema"} · {when(a.createdAt)}
              </p>
            </div>
          </Row>
        );
      })}
    </div>
  );
}
