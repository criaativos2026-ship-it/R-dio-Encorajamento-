import { redirect } from "next/navigation";
import { AvisoPrivacidade } from "@/components/aviso-privacidade";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { firstName } from "@/lib/format";
import { getCurrentUser, hasAcceptedPrivacy } from "@/lib/session";
import { AceiteForm } from "./aceite-form";

export const metadata = { title: "Privacidade" };

export default async function Aceite() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (hasAcceptedPrivacy(user)) redirect("/");
  const nova = !!user.privacyAcceptedAt; // já aceitou uma versão anterior

  return (
    <div className="min-h-dvh bg-bg-alt">
      <header className="border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-5 sm:h-20 sm:px-8">
          <Logo height={36} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-text uppercase sm:tracking-eyebrow">Antes de continuar</p>
        <h1 className="mt-2 text-[34px] leading-[1.05] font-black tracking-display sm:text-5xl">Seus dados, {firstName(user.name)}.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {nova
            ? "O aviso de privacidade foi atualizado. Leia a nova versão e confirme para continuar usando o app."
            : "Leia como o app usa os seus dados pessoais. Para usar o Controle Interação, é preciso concordar com este aviso."}
        </p>
        <Card className="mt-8">
          <CardContent className="max-h-[52dvh] overflow-y-auto sm:p-8">
            <AvisoPrivacidade />
          </CardContent>
        </Card>
        <AceiteForm />
      </main>
    </div>
  );
}
