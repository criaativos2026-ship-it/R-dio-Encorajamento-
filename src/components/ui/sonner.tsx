"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "calc(var(--radius) * 1.8)",
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: "font-sans !font-semibold" } }}
      {...props}
    />
  );
}

export { Toaster };
