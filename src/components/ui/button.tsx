import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  brand: "bg-brand text-white hover:bg-brand-hover",
  "outline-brand": "border border-brand text-brand-text hover:bg-brand hover:text-white",
  outline: "border border-line-15 text-ink hover:border-ink-35 bg-surface",
  ink: "bg-ink text-white hover:bg-ink/90",
  "outline-light": "border border-white/30 text-white/80 hover:text-white hover:border-white/70",
  ghost: "text-ink-50 hover:text-ink hover:bg-bg-alt",
  danger: "border border-line-15 text-danger hover:border-danger bg-surface",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-[52px] px-7 text-[15px] gap-2",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClass(variant: ButtonVariant = "brand", size: keyof typeof sizes = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-2xl font-bold transition-colors disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type Common = { variant?: ButtonVariant; size?: keyof typeof sizes; className?: string; children: ReactNode };

export function Button({ variant, size, className, ...props }: Common & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
