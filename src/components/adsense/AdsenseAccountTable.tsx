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
import { AdsenseAccountRow } from "./AdsenseAccountRow";
import type { AdsenseAccountData } from "./types";

interface AdsenseAccountTableProps {
  accounts: AdsenseAccountData[];
  activeId: string | null;
  orderDirty: boolean;
  savingOrder: boolean;
  dragDisabled?: boolean;
  onReorder: (accounts: AdsenseAccountData[]) => void;
  onSaveOrder: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AdsenseAccountTable({
  accounts,
  activeId,
  orderDirty,
  savingOrder,
  dragDisabled = false,
  onReorder,
  onSaveOrder,
  onEdit,
  onView,
  onDelete,
}: AdsenseAccountTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = accounts.findIndex((a) => a.id === active.id);
    const newIndex = accounts.findIndex((a) => a.id === over.id);
    onReorder(arrayMove(accounts, oldIndex, newIndex));
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={accounts.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-body-sm">
              <thead>
                <tr className="border-b border-border-subtle text-label-caps text-on-surface-variant">
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-semibold">계정 ID</th>
                  <th className="px-3 py-3 font-semibold">비밀번호</th>
                  <th className="px-3 py-3 font-semibold">명의자</th>
                  <th className="px-3 py-3 font-semibold">유튜브 계정</th>
                  <th className="px-3 py-3 font-semibold">채널명</th>
                  <th className="px-3 py-3 font-semibold">상태</th>
                  <th className="px-3 py-3 font-semibold">은행/계좌</th>
                  <th className="px-3 py-3 font-semibold">유튜브</th>
                  <th className="px-3 py-3 font-semibold">OTP</th>
                  <th className="px-3 py-3 text-right font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <AdsenseAccountRow
                    key={account.id}
                    account={account}
                    isActive={activeId === account.id}
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

      {accounts.length === 0 && (
        <div className="px-6 py-12 text-center text-body-sm text-on-surface-variant">
          등록된 애드센스 계정이 없습니다. 상단에서 계정을 추가해 주세요.
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
