"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SensitiveData } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PhoneDeviceData } from "./types";

interface PhoneDeviceRowProps {
  device: PhoneDeviceData;
  isActive: boolean;
  dragDisabled?: boolean;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatKrw(value?: number) {
  if (value == null) return "—";
  return `${value.toLocaleString()}원`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function formatPaymentDay(day?: number) {
  if (!day) return "—";
  return `매월 ${day}일`;
}

export function PhoneDeviceRow({
  device,
  isActive,
  dragDisabled = false,
  onEdit,
  onView,
  onDelete,
}: PhoneDeviceRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: device.id });

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
      <td className="px-3 py-3">
        <SensitiveData>{device.devicePhone}</SensitiveData>
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {device.phoneModel || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {device.mobileCarrier || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {device.mvnoProvider || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {device.mobilePlan || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {device.ratePlan || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {device.purchaseSource || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {formatKrw(device.priceKrw)}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {formatDate(device.purchaseDate)}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {device.bank || "—"}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">
        {formatPaymentDay(device.paymentDay)}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onView(device.id)}
            className="rounded-lg px-2.5 py-1.5 text-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-info"
          >
            보기
          </button>
          <button
            type="button"
            onClick={() => onEdit(device.id)}
            className="rounded-lg px-2.5 py-1.5 text-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => onDelete(device.id)}
            className="rounded-lg px-2.5 py-1.5 text-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-red-400"
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}
