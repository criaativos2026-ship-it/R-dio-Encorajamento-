import { Archive, History, House, ListChecks, TriangleAlert, type LucideIcon } from "lucide-react";

export const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Painel", icon: House },
  { href: "/checklist/montagem", label: "Montagem", icon: ListChecks },
  { href: "/checklist/desmontagem", label: "Desmontagem", icon: Archive },
  { href: "/central", label: "Central", icon: TriangleAlert },
  { href: "/historico", label: "Histórico", icon: History },
];

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
