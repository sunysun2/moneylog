"use client";

import { cn } from "@/lib/cn";

interface OtpUsageToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function OtpUsageBadge({
  value,
  compact = false,
}: {
  value: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold leading-tight",
        compact
          ? "w-10 px-0 py-0.5 text-[11px]"
          : "px-1.5 py-0.5 text-xs",
        value
          ? "bg-info/20 text-info"
          : "bg-status-inactive/20 text-red-400"
      )}
    >
      {value ? "사용" : "미사용"}
    </span>
  );
}

export function OtpUsageToggle({
  value,
  onChange,
  disabled = false,
  compact = false,
}: OtpUsageToggleProps) {
  return (
    <div className={cn("inline-flex rounded-lg border border-border-subtle p-0.5", compact && "text-xs")}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={cn(
          "rounded-md px-3 py-1.5 font-medium transition",
          value
            ? "bg-info/25 text-info"
            : "text-on-surface-variant hover:text-text-primary",
          compact && "px-2 py-1"
        )}
      >
        사용
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={cn(
          "rounded-md px-3 py-1.5 font-medium transition",
          !value
            ? "bg-status-inactive/25 text-red-400"
            : "text-on-surface-variant hover:text-text-primary",
          compact && "px-2 py-1"
        )}
      >
        미사용
      </button>
    </div>
  );
}
