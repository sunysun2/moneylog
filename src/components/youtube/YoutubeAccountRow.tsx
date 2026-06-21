"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge, RowActionButton, RowActionGroup, SensitiveData } from "@/components/ui";
import { getOtpBadges, type YoutubeAccountData } from "./types";
import { OtpUsageBadge } from "./OtpUsageToggle";
import { cn } from "@/lib/cn";

interface YoutubeAccountRowProps {
  account: YoutubeAccountData;
  isActive: boolean;
  dragDisabled?: boolean;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

function adsenseLabel(status: YoutubeAccountData["adsenseStatus"]) {
  switch (status) {
    case "linked":
      return { text: "연결됨", variant: "muted" as const };
    case "pending":
      return { text: "승인 대기", variant: "warning" as const };
    default:
      return { text: "미연결", variant: "muted" as const };
  }
}

function StatusCell({ status }: { status: YoutubeAccountData["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 text-primary-container">
        <span className="h-2 w-2 rounded-full bg-primary-container" />
        활성
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1.5 text-warning">
        <span aria-hidden>⚠</span>
        검토/경고
      </span>
    );
  }
  if (status === "deleted") {
    return (
      <span className="inline-flex items-center gap-1.5 text-red-400">
        삭제
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-warning">
      비활성
    </span>
  );
}

export function YoutubeAccountRow({
  account,
  isActive,
  dragDisabled = false,
  onEdit,
  onView,
  onDelete,
}: YoutubeAccountRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const adsense = adsenseLabel(account.adsenseStatus);
  const otpBadges = getOtpBadges(account.otps, account.otpInUse);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-border-subtle/60 transition",
        isActive && "bg-primary/5",
        isDragging && "z-10 scale-[1.02] bg-surface-container-high glow-primary"
      )}
    >
      <td className="w-10 px-3 py-3">
        <button
          type="button"
          className={cn(
            "text-on-surface-variant",
            dragDisabled
              ? "cursor-not-allowed opacity-30"
              : "cursor-grab hover:text-text-primary active:cursor-grabbing"
          )}
          aria-label="순서 변경"
          disabled={dragDisabled}
          {...(dragDisabled ? {} : { ...attributes, ...listeners })}
        >
          ⋮⋮
        </button>
      </td>
      <td className="px-3 py-3">
        <SensitiveData>{account.accountId}</SensitiveData>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-2">
          <span className="text-on-surface-variant" aria-hidden>🔒</span>
          <SensitiveData>••••••••</SensitiveData>
        </span>
      </td>
      <td className="px-3 py-3">
        <StatusCell status={account.status} />
      </td>
      <td className="px-3 py-3">
        <Badge variant={adsense.variant}>{adsense.text}</Badge>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-2">
          <OtpUsageBadge value={account.otpInUse} compact />
          {otpBadges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {otpBadges.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <RowActionGroup>
          <RowActionButton variant="view" onClick={() => onView(account.id)}>
            보기
          </RowActionButton>
          <RowActionButton variant="edit" onClick={() => onEdit(account.id)}>
            편집
          </RowActionButton>
          <RowActionButton variant="delete" onClick={() => onDelete(account.id)}>
            삭제
          </RowActionButton>
        </RowActionGroup>
      </td>
    </tr>
  );
}
