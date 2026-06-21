"use client";

import { cn } from "@/lib/cn";

interface SensitiveDataProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "div";
  container?: boolean;
}

export function SensitiveData({
  children,
  className,
  as: Tag = "span",
}: SensitiveDataProps) {
  return <Tag className={cn("font-data-mono", className)}>{children}</Tag>;
}
