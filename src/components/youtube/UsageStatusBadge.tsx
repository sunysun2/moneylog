import { cn } from "@/lib/cn";
import type { AccountStatus } from "@/models/YoutubeAccount";

interface UsageStatusBadgeProps {
  status: AccountStatus;
  isInUse: boolean;
  className?: string;
}

export function UsageStatusBadge({
  status,
  isInUse,
  className,
}: UsageStatusBadgeProps) {
  const label = isInUse ? "사용 중" : "미사용";

  const style =
    status === "active" || status === "warning"
      ? "border-info/50 bg-info/20 text-info"
      : status === "deleted"
        ? "border-status-inactive/50 bg-status-inactive/20 text-red-400"
        : "border-warning/50 bg-warning/20 text-warning";

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-label-caps text-on-surface-variant">사용 유무</p>
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold",
          style
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function syncIsInUseWithStatus(status: AccountStatus): boolean {
  return status === "active" || status === "warning";
}
