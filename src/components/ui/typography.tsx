// src/components/ui/typography.tsx
import React from "react";
import { cn } from "@/lib/utils";

export function H1({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <h1 className={cn("text-2xl font-bold tracking-tight", className)}>{children}</h1>;
}
export function H2({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <h2 className={cn("text-xl font-semibold tracking-tight", className)}>{children}</h2>;
}
export function Muted({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}
