import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  default: "bg-surface-container-high text-on-surface-variant",
  success: "bg-primary-container/15 text-primary-container",
  warning: "bg-warning/15 text-warning",
  muted: "bg-surface-container-high text-text-muted",
};

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
