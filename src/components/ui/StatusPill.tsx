import { cn } from "@/lib/cn";

type StatusVariant = "active" | "warning" | "inactive" | "pending";

interface StatusPillProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

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

export function StatusPill({ variant, children, className }: StatusPillProps) {
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
