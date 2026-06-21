"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type RowActionVariant = "view" | "edit" | "delete";

interface RowActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: RowActionVariant;
}

const variantStyles: Record<RowActionVariant, string> = {
  view: "text-info bg-info/15 hover:bg-info/25",
  edit: "text-primary bg-primary/15 hover:bg-primary/25",
  delete: "text-red-400 bg-red-400/15 hover:bg-red-400/25",
};

export function RowActionButton({
  variant,
  className,
  children,
  type = "button",
  ...props
}: RowActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-body-sm font-semibold transition",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function RowActionGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>{children}</div>
  );
}
