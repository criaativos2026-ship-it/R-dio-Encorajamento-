import type { ReactNode } from "react";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Cartão de seção do app, montado com o Card do shadcn. */
export function Panel({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <Card id={id} className={cn("overflow-hidden", className)}>
      {children}
    </Card>
  );
}

export function PanelHeader({ title, kicker, action }: { title?: ReactNode; kicker?: string; action?: ReactNode }) {
  return (
    <CardHeader className="items-center">
      {kicker && <CardDescription>{kicker}</CardDescription>}
      {title && <CardTitle>{title}</CardTitle>}
      {action && <CardAction>{action}</CardAction>}
    </CardHeader>
  );
}
