"use client";

import type { VariantProps } from "class-variance-authority";
import { useFormStatus } from "react-dom";
import { Button, type buttonVariants } from "./button";

export function SubmitButton({
  children,
  pendingText,
  ...props
}: Omit<React.ComponentProps<"button">, "type"> & VariantProps<typeof buttonVariants> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? (pendingText ?? "Salvando…") : children}
    </Button>
  );
}
