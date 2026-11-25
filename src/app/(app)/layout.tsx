import Link from "next/link";
import { Logo } from "@/components/logo";
import { TabBar, TopNav } from "@/components/shell/top-nav";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shell/user-menu";
import { PERFIL_LABEL } from "@/lib/constants";
import { countMyPending } from "@/lib/escalas";
import { countOpenProblems } from "@/lib/queries";
import { isGestao, requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [openProblems, pendingInvites] = await Promise.all([countOpenProblems(), countMyPending(user.id)]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg print:hidden">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 sm:px-8 lg:h-20 xl:gap-8">
          <Link href="/" className="flex items-center gap-4 max-lg:[&_img]:h-[34px]!" aria-label="Painel">
            <Logo height={40} />
            <span className="hidden border-l border-line-15 pl-4 text-[11px] leading-[1.6] font-bold tracking-[0.15em] whitespace-nowrap text-ink-50 uppercase 2xl:block">
              Controle Interação
              <br />
              Rádio Encorajamento
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-6 xl:gap-8">
            <TopNav openProblems={openProblems} pendingInvites={pendingInvites} showTeam={isGestao(user)} />
            <div className="hidden lg:block">
              <Button asChild variant="brandOutline">
<Link href="/central#registrar">
        Registrar problema
       </Link>
</Button>
            </div>
            <UserMenu name={user.name} email={user.email} role={PERFIL_LABEL[user.role]} gestao={isGestao(user)} />
          </div>
        </div>
      </header>
      <div className="pb-28 lg:pb-0">{children}</div>
      <TabBar openProblems={openProblems} pendingInvites={pendingInvites} />
    </div>
  );
}
