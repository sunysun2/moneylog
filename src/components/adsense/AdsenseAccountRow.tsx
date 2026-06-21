"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge, RowActionButton, RowActionGroup, SensitiveData } from "@/components/ui";
import { OtpUsageBadge } from "@/components/youtube/OtpUsageToggle";
import { cn } from "@/lib/cn";
import { getOtpBadges, type AdsenseAccountData } from "./types";
import type { AccountStatus } from "@/models/AdsenseAccount";

interface AdsenseAccountRowProps {
  account: AdsenseAccountData;
  isActive: boolean;
  dragDisabled?: boolean;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

function StatusCell({ status }: { status: AccountStatus }) {
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
        경고
      </span>
    );
  }
  if (status === "deleted") {
    return <span className="text-red-400">삭제</span>;
  }
  if (status === "inactive") {
    return <span className="text-warning">비활성</span>;
  }
  return <span className="text-on-surface-variant">대기</span>;
}

export function AdsenseAccountRow({
  account,
  isActive,
  dragDisabled = false,
  onEdit,
  onView,
  onDelete,
}: AdsenseAccountRowProps) {
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
          <span className="text-on-surface-variant" aria-hidden>
            🔒
          </span>
          <SensitiveData>••••••••</SensitiveData>
        </span>
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {account.holderName || "—"}
      </td>
      <td className="px-3 py-3">
        <SensitiveData>
          {account.youtubeAccount
            ? account.linkedYoutubeCount && account.linkedYoutubeCount > 1
              ? `${account.youtubeAccount} 외 ${account.linkedYoutubeCount - 1}개`
              : account.youtubeAccount
            : "—"}
        </SensitiveData>
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {account.channelName
          ? account.linkedYoutubeCount && account.linkedYoutubeCount > 1
            ? `${account.channelName} 외 ${account.linkedYoutubeCount - 1}개`
            : account.channelName
          : "—"}
      </td>
      <td className="px-3 py-3">
        <StatusCell status={account.status} />
      </td>
      <td className="px-3 py-3">
        <div className="space-y-0.5">
          <span className="text-on-surface-variant">{account.bank || "—"}</span>
          {account.accountNumber && (
            <div className="text-xs text-text-muted">
              <SensitiveData>••••{account.accountNumber.slice(-4)}</SensitiveData>
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        {account.linkedYoutubeCount && account.linkedYoutubeCount > 0 ? (
          <Badge variant="success">
            {account.linkedYoutubeCount > 1
              ? `${account.linkedYoutubeCount}개 연동`
              : "연동"}
          </Badge>
        ) : account.linkedYoutubeAccountId ? (
          <Badge variant="success">연동</Badge>
        ) : (
          <Badge variant="muted">미연동</Badge>
        )}
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
