import Link from "next/link";
import { Logo } from "@/components/logo";
import { TabBar, TopNav } from "@/components/shell/top-nav";
import { ButtonLink } from "@/components/ui/button";
import { initials } from "@/lib/format";
import { countOpenProblems } from "@/lib/queries";
import { isCoordenacao, requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const openProblems = await countOpenProblems();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
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
            <TopNav openProblems={openProblems} showTeam={isCoordenacao(user)} />
            <div className="hidden lg:block">
              <ButtonLink href="/central#registrar" variant="outline-brand">
                Registrar problema
              </ButtonLink>
            </div>
            <Link
              href="/perfil"
              title={`${user.name}: meu perfil`}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-bold text-white transition-opacity hover:opacity-85"
            >
              {initials(user.name)}
            </Link>
          </div>
        </div>
      </header>
      <div className="pb-28 lg:pb-0">{children}</div>
      <TabBar openProblems={openProblems} />
    </div>
  );
}
