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
import { PhoneDeviceRow } from "./PhoneDeviceRow";
import type { PhoneDeviceData } from "./types";

interface PhoneDeviceTableProps {
  devices: PhoneDeviceData[];
  activeId: string | null;
  orderDirty: boolean;
  savingOrder: boolean;
  dragDisabled?: boolean;
  onReorder: (devices: PhoneDeviceData[]) => void;
  onSaveOrder: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PhoneDeviceTable({
  devices,
  activeId,
  orderDirty,
  savingOrder,
  dragDisabled = false,
  onReorder,
  onSaveOrder,
  onEdit,
  onView,
  onDelete,
}: PhoneDeviceTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = devices.findIndex((d) => d.id === active.id);
    const newIndex = devices.findIndex((d) => d.id === over.id);
    onReorder(arrayMove(devices, oldIndex, newIndex));
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={devices.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-body-sm">
              <thead>
                <tr className="border-b border-border-subtle text-label-caps text-on-surface-variant">
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-semibold">전화번호</th>
                  <th className="px-3 py-3 font-semibold">모델</th>
                  <th className="px-3 py-3 font-semibold">통신사</th>
                  <th className="px-3 py-3 font-semibold">알뜰폰</th>
                  <th className="px-3 py-3 font-semibold">통신요금</th>
                  <th className="px-3 py-3 font-semibold">요금제</th>
                  <th className="px-3 py-3 font-semibold">구매처</th>
                  <th className="px-3 py-3 font-semibold">휴대폰 가격</th>
                  <th className="px-3 py-3 font-semibold">구매일</th>
                  <th className="px-3 py-3 font-semibold">은행 / 카드</th>
                  <th className="px-3 py-3 font-semibold">결제일</th>
                  <th className="px-3 py-3 text-right font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <PhoneDeviceRow
                    key={device.id}
                    device={device}
                    isActive={activeId === device.id}
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

      {devices.length === 0 && (
        <div className="px-6 py-12 text-center text-body-sm text-on-surface-variant">
          등록된 휴대폰이 없습니다. 상단에서 휴대폰을 추가해 주세요.
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
