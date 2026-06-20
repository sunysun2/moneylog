"use client";

import { useEffect, useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Input } from "@/components/ui";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { notify } from "@/lib/notify";
import type { ChannelPreferencesData } from "@/lib/channel-preference-service";

interface CategoryCountrySettingsModalProps {
  open: boolean;
  preferences: ChannelPreferencesData;
  onClose: () => void;
  onSaved: (preferences: ChannelPreferencesData) => void;
}

function SortableListItem({
  id,
  label,
  onDelete,
}: {
  id: string;
  label: string;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 text-body-sm",
        isDragging && "z-10 bg-surface-container-high glow-primary"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="cursor-grab text-on-surface-variant hover:text-text-primary active:cursor-grabbing"
          aria-label="순서 변경"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <span className="truncate">{label}</span>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 text-on-surface-variant hover:text-red-400"
      >
        삭제
      </button>
    </li>
  );
}

function SortableListEditor({
  label,
  addLabel,
  items,
  onChange,
}: {
  label: string;
  addLabel: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleAdd() {
    const value = draft.trim();
    if (!value) return;
    if (items.includes(value)) {
      notify.error("이미 존재하는 항목입니다.");
      return;
    }
    onChange([...items, value]);
    setDraft("");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3">
      <p className="text-label-caps text-on-surface-variant">{label}</p>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`${label} 입력`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={handleAdd} className="shrink-0">
          {addLabel}
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((item) => (
              <SortableListItem
                key={item}
                id={item}
                label={item}
                onDelete={() => onChange(items.filter((i) => i !== item))}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export function CategoryCountrySettingsModal({
  open,
  preferences,
  onClose,
  onSaved,
}: CategoryCountrySettingsModalProps) {
  const [categories, setCategories] = useState(preferences.categories);
  const [countries, setCountries] = useState(preferences.countries);
  const [templates, setTemplates] = useState(preferences.templates);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCategories(preferences.categories);
      setCountries(preferences.countries);
      setTemplates(preferences.templates);
    }
  }, [open, preferences]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/channels/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories, countries, templates }),
      });
      if (!res.ok) throw new Error();
      const data: ChannelPreferencesData = await res.json();
      notify.success("카테고리 · 템플릿 · 나라 설정이 저장되었습니다.");
      onSaved(data);
      onClose();
    } catch {
      notify.error("설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="카테고리 · 템플릿 · 나라 설정"
      className="max-w-2xl"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={handleSave}
          confirmLabel="저장"
          loading={saving}
        />
      }
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <SortableListEditor
          label="카테고리"
          addLabel="카테고리 추가"
          items={categories}
          onChange={setCategories}
        />
        <SortableListEditor
          label="나라"
          addLabel="나라 추가"
          items={countries}
          onChange={setCountries}
        />
        <SortableListEditor
          label="템플릿"
          addLabel="템플릿 추가"
          items={templates}
          onChange={setTemplates}
        />
      </div>
    </Modal>
  );
}
