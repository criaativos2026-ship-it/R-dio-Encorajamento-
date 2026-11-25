"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { NAV, isActive } from "./nav";

export function TopNav({ openProblems, pendingInvites, showTeam }: { openProblems: number; pendingInvites: number; showTeam: boolean }) {
  const pathname = usePathname();
  const items = showTeam ? [...NAV, { href: "/gestao", label: "Gestão", icon: Users, mobile: false }] : NAV;
  return (
    <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex xl:gap-7">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("relative text-[15px] transition-colors", active ? "font-bold text-ink" : "font-medium text-ink-50 hover:text-ink")}
          >
            {item.label}
            {item.href === "/central" && openProblems > 0 && (
              <span className="absolute -top-2 -right-4 grid size-[18px] place-items-center rounded-full bg-brand text-[10px] font-bold text-white">{openProblems}</span>
            )}
            {item.href === "/escalas" && pendingInvites > 0 && (
              <span aria-label={`${pendingInvites} escalas para responder`} className="absolute -top-2 -right-4 grid size-[18px] place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                {pendingInvites}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar({ openProblems, pendingInvites }: { openProblems: number; pendingInvites: number }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 print:hidden border-t border-line-15 bg-bg px-1 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden"
    >
      {NAV.filter((n) => n.mobile).map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("relative grid justify-items-center gap-1 py-1 text-[11px] font-semibold", active ? "text-brand-text" : "text-ink-50")}>
            <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 2} />
            {label}
            {href === "/central" && openProblems > 0 && <span className="absolute top-0 right-[calc(50%-18px)] size-2 rounded-full bg-brand" />}
            {href === "/escalas" && pendingInvites > 0 && (
              <span className="absolute -top-0.5 right-[calc(50%-22px)] grid size-[17px] place-items-center rounded-full bg-brand text-[10px] font-bold text-white">{pendingInvites}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
