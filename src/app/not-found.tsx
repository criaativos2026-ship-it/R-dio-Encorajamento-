import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div>
        <p className="font-mono text-sm text-ink-35">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-display">Página não encontrada.</h1>
        <ButtonLink href="/" className="mt-8">
          Voltar ao painel
        </ButtonLink>
      </div>
    </main>
  );
}
