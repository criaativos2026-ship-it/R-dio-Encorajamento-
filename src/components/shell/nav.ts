import { Archive, CalendarDays, History, House, ListChecks, TriangleAlert, type LucideIcon } from "lucide-react";

/** `mobile: false` = só no menu do topo (no celular fica no menu da conta e no Painel). */
export const NAV: { href: string; label: string; icon: LucideIcon; mobile: boolean }[] = [
  { href: "/", label: "Painel", icon: House, mobile: true },
  { href: "/checklist/montagem", label: "Montagem", icon: ListChecks, mobile: true },
  { href: "/checklist/desmontagem", label: "Desmontagem", icon: Archive, mobile: true },
  { href: "/central", label: "Central", icon: TriangleAlert, mobile: true },
  { href: "/escalas", label: "Escalas", icon: CalendarDays, mobile: true },
  { href: "/historico", label: "Histórico", icon: History, mobile: false },
];

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
