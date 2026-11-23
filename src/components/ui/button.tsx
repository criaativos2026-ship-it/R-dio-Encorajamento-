import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-brand-hover",
        destructive: "border border-input bg-background text-destructive hover:border-destructive",
        outline: "border border-input bg-background hover:border-ink-35",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-ink-50 hover:bg-accent hover:text-accent-foreground",
        link: "text-brand-text underline-offset-4 hover:underline",
        // Variantes da identidade Missão Encorajamento (padrões do site)
        brandOutline: "border border-primary text-brand-text hover:bg-primary hover:text-primary-foreground",
        ink: "bg-ink text-white hover:bg-ink/90",
        outlineLight: "border border-white/30 text-white/80 hover:border-white/70 hover:text-white",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 gap-1.5 px-3.5 text-[13px]",
        lg: "h-[52px] px-7 text-[15px]",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
