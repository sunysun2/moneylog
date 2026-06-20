"use client";

import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  lockedIcon?: string;
  unlockedIcon?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  lockedIcon = "🔒",
  unlockedIcon = "👁️",
  className,
}: SwitchProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-3 select-none",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? "민감 정보 표시 전환"}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-7 w-12 rounded-full border border-border-subtle transition focus-ring-primary",
          checked ? "bg-surface-container-high" : "bg-primary-container glow-primary"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-surface text-xs transition-transform",
            checked ? "left-0.5" : "left-[calc(100%-1.625rem)]"
          )}
        >
          {checked ? lockedIcon : unlockedIcon}
        </span>
      </button>
      {label && (
        <span className="text-body-sm font-medium text-on-surface">{label}</span>
      )}
    </label>
  );
}
