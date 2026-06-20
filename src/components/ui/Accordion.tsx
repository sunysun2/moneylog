"use client";

import { cn } from "@/lib/cn";
import { useState, type ReactNode } from "react";

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("rounded-xl border border-border-subtle bg-bg-surface", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-body-sm font-medium text-on-surface"
      >
        {title}
        <span
          className={cn(
            "text-text-muted transition-transform",
            open && "rotate-180"
          )}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-border-subtle px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
