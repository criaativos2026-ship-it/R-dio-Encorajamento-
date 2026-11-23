import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Controle Interação — Rádio Encorajamento",
    short_name: "Controle Interação",
    description: "Equipe de serviço da Missão Encorajamento",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    lang: "pt-BR",
    icons: [{ src: "/icon.png", sizes: "300x300", type: "image/png", purpose: "any" }],
  };
}
