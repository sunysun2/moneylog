"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui";
import { ChannelRow } from "./ChannelRow";
import type { ChannelData } from "./types";

interface ChannelTableProps {
  channels: ChannelData[];
  activeId: string | null;
  orderDirty: boolean;
  savingOrder: boolean;
  dragDisabled?: boolean;
  onReorder: (channels: ChannelData[]) => void;
  onSaveOrder: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChannelTable({
  channels,
  activeId,
  orderDirty,
  savingOrder,
  dragDisabled = false,
  onReorder,
  onSaveOrder,
  onEdit,
  onView,
  onDelete,
}: ChannelTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = channels.findIndex((c) => c.id === active.id);
    const newIndex = channels.findIndex((c) => c.id === over.id);
    onReorder(arrayMove(channels, oldIndex, newIndex));
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={channels.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-left text-body-sm">
              <thead>
                <tr className="border-b border-border-subtle text-label-caps text-on-surface-variant">
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-semibold">채널명</th>
                  <th className="px-3 py-3 font-semibold">핸들</th>
                  <th className="px-3 py-3 font-semibold">형식</th>
                  <th className="px-3 py-3 font-semibold">카테고리</th>
                  <th className="px-3 py-3 font-semibold">국가</th>
                  <th className="px-3 py-3 font-semibold">생성일</th>
                  <th className="px-3 py-3 font-semibold">수입</th>
                  <th className="px-3 py-3 font-semibold">상태</th>
                  <th className="px-3 py-3 font-semibold">유튜브</th>
                  <th className="px-3 py-3 font-semibold">애드센스</th>
                  <th className="px-3 py-3 font-semibold">수창</th>
                  <th className="px-3 py-3 text-right font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    isActive={activeId === channel.id}
                    dragDisabled={dragDisabled}
                    onEdit={onEdit}
                    onView={onView}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>

      {channels.length === 0 && (
        <div className="px-6 py-12 text-center text-body-sm text-on-surface-variant">
          등록된 채널이 없습니다. 상단에서 채널을 추가해 주세요.
        </div>
      )}

      {orderDirty && (
        <div className="flex justify-end border-t border-border-subtle px-4 py-3">
          <Button onClick={onSaveOrder} disabled={savingOrder}>
            {savingOrder ? "저장 중..." : "순서 저장"}
          </Button>
        </div>
      )}
    </div>
  );
}
