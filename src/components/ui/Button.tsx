"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-text-primary hover:opacity-90 glow-primary",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:opacity-90",
  ghost:
    "border border-border-subtle bg-transparent text-on-surface hover:bg-surface-container-high",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-red-700/60",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-body-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-ring-primary",
        variantStyles[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
