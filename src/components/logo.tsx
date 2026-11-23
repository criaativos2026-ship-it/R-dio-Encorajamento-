import Image from "next/image";

/** Logo oficial — arquivos originais do site, sempre com largura proporcional (1181 × 373). */
export function Logo({ variant = "black", height = 40, className }: { variant?: "black" | "white"; height?: number; className?: string }) {
  return (
    <Image
      src={variant === "white" ? "/logo-white.svg" : "/logo-black.svg"}
      alt="Missão Encorajamento"
      width={Math.round((height * 1181) / 373)}
      height={height}
      priority
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
