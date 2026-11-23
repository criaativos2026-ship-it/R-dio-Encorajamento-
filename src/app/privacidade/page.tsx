import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AvisoPrivacidade } from "@/components/aviso-privacidade";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Aviso de privacidade" };

/** Página pública: qualquer pessoa pode ler o aviso, mesmo sem login. */
export default function Privacidade() {
  return (
    <div className="min-h-dvh bg-bg-alt">
      <header className="border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <Logo height={36} />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline">
            <ArrowLeft className="size-4" /> Voltar ao app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-text uppercase sm:tracking-eyebrow">LGPD · Lei nº 13.709/2018</p>
        <h1 className="mt-2 text-[34px] leading-[1.05] font-black tracking-display sm:text-5xl">Aviso de privacidade</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Como o Controle Interação trata os seus dados pessoais, em linguagem simples.</p>
        <Card className="mt-8">
          <CardContent className="sm:p-8">
            <AvisoPrivacidade />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
