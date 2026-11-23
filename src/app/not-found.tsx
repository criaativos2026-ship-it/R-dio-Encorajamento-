import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div>
        <p className="font-mono text-sm text-ink-35">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-display">Página não encontrada.</h1>
        <Button asChild className="mt-8">
<Link href="/">
     Voltar ao painel
    </Link>
</Button>
      </div>
    </main>
  );
}
