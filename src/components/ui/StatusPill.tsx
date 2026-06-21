import { cn } from "@/lib/cn";

type StatusVariant = "active" | "warning" | "inactive" | "pending";

interface StatusPillProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
  exportMode?: boolean;
}

const exportVariantStyles: Record<
  StatusVariant,
  { backgroundColor: string; color: string; dotColor: string }
> = {
  active: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    dotColor: "#10b981",
  },
  warning: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "#f59e0b",
    dotColor: "#f59e0b",
  },
  inactive: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "#f59e0b",
    dotColor: "#f59e0b",
  },
  pending: {
    backgroundColor: "rgba(255, 185, 95, 0.15)",
    color: "#ffb95f",
    dotColor: "#ffb95f",
  },
};

const variantStyles: Record<StatusVariant, string> = {
  active: "bg-primary-container/15 text-primary-container",
  warning: "bg-warning/15 text-warning",
  inactive: "bg-warning/15 text-warning",
  pending: "bg-tertiary/15 text-tertiary",
};

const dotStyles: Record<StatusVariant, string> = {
  active: "bg-primary-container",
  warning: "bg-warning",
  inactive: "bg-warning",
  pending: "bg-tertiary",
};

export function StatusPill({ variant, children, className, exportMode }: StatusPillProps) {
  if (exportMode) {
    const palette = exportVariantStyles[variant];

    return (
      <span
        className={className}
        style={{
          display: "inline-block",
          backgroundColor: palette.backgroundColor,
          color: palette.color,
          borderRadius: "9999px",
          padding: "5px 12px",
          fontSize: "13px",
          lineHeight: "16px",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            marginRight: "6px",
            borderRadius: "9999px",
            backgroundColor: palette.dotColor,
            verticalAlign: "0.05em",
          }}
        />
        <span style={{ verticalAlign: "baseline" }}>{children}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[variant])} />
      {children}
    </span>
  );
}
