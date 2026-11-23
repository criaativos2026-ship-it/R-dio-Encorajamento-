import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ListRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-start gap-4 border-t border-line px-5 py-4 first:border-t-0 sm:px-6", className)}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-6 py-10 text-center text-sm text-ink-50">{children}</p>;
}
