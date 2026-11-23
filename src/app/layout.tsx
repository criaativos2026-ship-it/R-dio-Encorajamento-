import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Mesma fonte do site oficial, carregada da mesma forma (next/font).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Controle Interação — Rádio Encorajamento", template: "%s · Controle Interação" },
  description: "Ferramenta da equipe de serviço da Missão Encorajamento para a Rádio Encorajamento.",
  applicationName: "Controle Interação",
  appleWebApp: { capable: true, title: "Controle Interação", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
