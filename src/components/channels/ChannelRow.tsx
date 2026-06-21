"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge, RowActionButton, RowActionGroup } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ContentFormatBadge } from "./ContentFormatBadge";
import { type ChannelData } from "./types";
import type { ChannelStatus } from "@/models/Channel";

interface ChannelRowProps {
  channel: ChannelData;
  isActive: boolean;
  dragDisabled?: boolean;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

function StatusCell({ status }: { status: ChannelStatus }) {
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
  return <span className="text-on-surface-variant">비활성</span>;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return value.slice(0, 10);
}

export function ChannelRow({
  channel,
  isActive,
  dragDisabled = false,
  onEdit,
  onView,
  onDelete,
}: ChannelRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      <td className="px-3 py-3 font-medium text-text-primary">{channel.name}</td>
      <td className="px-3 py-3 text-on-surface-variant">{channel.handle || "—"}</td>
      <td className="px-3 py-3 align-middle">
        <ContentFormatBadge format={channel.contentFormat} size="sm" />
      </td>
      <td className="px-3 py-3 text-on-surface-variant">{channel.category || "—"}</td>
      <td className="px-3 py-3 text-on-surface-variant">{channel.country || "—"}</td>
      <td className="px-3 py-3 text-on-surface-variant">{formatDate(channel.createdDate)}</td>
      <td className="px-3 py-3">
        {channel.hasRevenue ? (
          <Badge variant="success">예</Badge>
        ) : (
          <Badge variant="muted">아니오</Badge>
        )}
      </td>
      <td className="px-3 py-3">
        <StatusCell status={channel.status} />
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {channel.youtubeAccountLabel || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {channel.adsenseAccountLabel || "—"}
      </td>
      <td className="px-3 py-3">
        {channel.monetizationType === "organic" ? (
          <Badge variant="muted">자력</Badge>
        ) : (
          <Badge variant="default">구매</Badge>
        )}
      </td>
      <td className="px-3 py-3">
        <RowActionGroup>
          <RowActionButton variant="view" onClick={() => onView(channel.id)}>
            보기
          </RowActionButton>
          <RowActionButton variant="edit" onClick={() => onEdit(channel.id)}>
            편집
          </RowActionButton>
          <RowActionButton variant="delete" onClick={() => onDelete(channel.id)}>
            삭제
          </RowActionButton>
        </RowActionGroup>
      </td>
    </tr>
  );
}
