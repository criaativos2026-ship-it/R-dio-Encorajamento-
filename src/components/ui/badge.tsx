import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Etiquetas no padrão do site (PRESENCIAL, LIBRAS, ★ KIDS): maiúsculas, espaçadas, cantos pequenos.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-sm border px-2 py-[3px] text-[10px] font-bold tracking-[0.15em] whitespace-nowrap uppercase [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground",
        secondary: "border-ink-25 bg-secondary text-ink",
        destructive: "border-destructive bg-destructive text-white",
        outline: "border-ink-25 text-ink-50",
        brand: "border-primary/40 bg-primary/[0.08] text-brand-text",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
