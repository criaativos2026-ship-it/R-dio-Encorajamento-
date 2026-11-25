import { Badge } from "@/components/ui/badge";
import { STATUS_ESCALA } from "@/lib/constants";

export function StatusEscala({ status }: { status: "pendente" | "aceita" | "recusada" }) {
  const variant = status === "pendente" ? "brand" : status === "aceita" ? "secondary" : "outline";
  return (
    <Badge variant={variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_ESCALA[status]}
    </Badge>
  );
}
