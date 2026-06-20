"use client";

import { useBlurStore } from "@/stores/blurStore";
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
  container = false,
}: SensitiveDataProps) {
  const isBlurred = useBlurStore((s) => s.isBlurred);

  return (
    <Tag
      className={cn(
        "sensitive-data font-data-mono",
        container ? "sensitive-data-container" : "",
        isBlurred && "is-blurred",
        className
      )}
    >
      {children}
    </Tag>
  );
}
