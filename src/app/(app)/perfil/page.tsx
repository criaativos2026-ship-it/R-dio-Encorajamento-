import Link from "next/link";
import { LogOut, Users } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { PasswordForm, ProfileForm } from "@/components/perfil-forms";
import { MeusDadosPrivacidade } from "@/components/privacidade-perfil";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/heading";
import { Panel, PanelHeader } from "@/components/panel";
import { FUNCOES, PERFIL_LABEL } from "@/lib/constants";
import { isGestao, requireUser } from "@/lib/session";

export const metadata = { title: "Perfil" };

export default async function Perfil() {
  const user = await requireUser();
  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeader
        kicker={PERFIL_LABEL[user.role]}
        title={user.name}
        description={user.email}
        actions={
          <>
            {isGestao(user) && (
              <Button asChild variant="outline" className="lg:hidden">
<Link href="/gestao">
        <Users className="size-4" /> Gestão
       </Link>
</Button>
            )}
            <form action={logout}>
              <Button type="submit" variant="outline">
                <LogOut className="size-4" /> Sair
              </Button>
            </form>
          </>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="self-start">
          <PanelHeader title="Meus dados" />
          <ProfileForm name={user.name} defaultFunction={user.defaultFunction ?? FUNCOES[0]} />
        </Panel>
        <Panel className="self-start">
          <PanelHeader title="Senha" />
          <PasswordForm />
        </Panel>
        <Panel className="self-start md:col-span-2">
          <PanelHeader kicker="LGPD" title="Meus dados e privacidade" />
          <MeusDadosPrivacidade acceptedAt={user.privacyAcceptedAt} version={user.privacyVersion} deletionRequestedAt={user.deletionRequestedAt} />
        </Panel>
      </div>
    </main>
  );
}
