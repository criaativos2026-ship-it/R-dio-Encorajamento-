"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/gestao", label: "Visão geral" },
  { href: "/gestao/pessoas", label: "Pessoas" },
  { href: "/gestao/checklists", label: "Checklists" },
];

export function GestaoTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Gestão" className="mb-8 inline-flex print:hidden max-w-full overflow-x-auto rounded-2xl border border-border bg-card p-1">
      {TABS.map((t) => {
        const active = t.href === "/gestao" ? pathname === "/gestao" || pathname.startsWith("/gestao/cultos") : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn("rounded-xl px-5 py-2 text-sm font-bold whitespace-nowrap transition-colors", active ? "bg-ink text-white" : "text-ink-50 hover:text-ink")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
