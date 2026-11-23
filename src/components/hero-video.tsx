"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Vídeo de fundo da faixa preta, no mesmo estilo do topo do site oficial.
 * Mudo, em repetição, sem controles; versão leve no celular. Quem pediu "reduzir movimento"
 * no aparelho vê apenas a imagem de capa.
 */
export function HeroVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // O React não grava o atributo "muted" no HTML; sem ele o iPhone não inicia sozinho.
    video.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, []);

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <video
        ref={ref}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/missao-hero-poster.jpg"
        disablePictureInPicture
      >
        <source src="/videos/missao-hero-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/missao-hero.mp4" type="video/mp4" />
      </video>
      {/* Camadas escuras para o texto continuar legível sobre qualquer cena */}
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-night/30 to-transparent" />
    </div>
  );
}
