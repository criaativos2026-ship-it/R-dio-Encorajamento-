import { Logo } from "@/components/logo";
import { Eyebrow } from "@/components/ui/heading";

/** Tela dividida: faixa escura com a marca (como o topo do site) e formulário em fundo claro. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-bg lg:grid-cols-[1.1fr_1fr]">
      <section className="flex flex-col justify-between gap-12 bg-night px-6 py-8 text-white sm:px-12 sm:py-12">
        <Logo variant="white" height={48} />
        <div>
          <Eyebrow light>Equipe de serviço</Eyebrow>
          <h1 className="mt-5 text-5xl leading-[1.02] font-black tracking-display sm:text-7xl">
            Controle
            <br />
            <span className="text-brand">Interação.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
            Rádio Encorajamento. Montagem, desmontagem, problemas e comunicados da equipe em um só lugar.
          </p>
        </div>
        <p className="hidden text-xs text-white/35 lg:block">Missão Encorajamento · São Carlos — SP</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  );
}
