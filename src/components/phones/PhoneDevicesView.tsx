"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/layout/SearchBar";
import { useSearchStore } from "@/stores/searchStore";
import { notify } from "@/lib/notify";
import { PhoneDeviceForm } from "./PhoneDeviceForm";
import { PhoneDeviceTable } from "./PhoneDeviceTable";
import {
  EMPTY_FORM,
  deviceToForm,
  formToPayload,
  type FormMode,
  type PhoneDeviceData,
  type PhoneDeviceFormState,
} from "./types";

export function PhoneDevicesView() {
  const globalQuery = useSearchStore((s) => s.query);
  const setGlobalQuery = useSearchStore((s) => s.setQuery);
  const [devices, setDevices] = useState<PhoneDeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PhoneDeviceFormState>(EMPTY_FORM);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/phones");
      if (!res.ok) throw new Error();
      const data: PhoneDeviceData[] = await res.json();
      setDevices(data);
      setOrderDirty(false);
    } catch {
      notify.error("휴대폰 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const isSearching = globalQuery.trim().length > 0;

  const filteredDevices = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter(
      (d) =>
        d.devicePhone.includes(q) ||
        d.phoneModel?.toLowerCase().includes(q) ||
        d.mobileCarrier?.toLowerCase().includes(q) ||
        d.mvnoProvider?.toLowerCase().includes(q) ||
        d.mobilePlan?.toLowerCase().includes(q) ||
        d.ratePlan?.toLowerCase().includes(q) ||
        d.purchaseSource?.toLowerCase().includes(q) ||
        d.bank?.toLowerCase().includes(q)
    );
  }, [devices, globalQuery]);

  function openNewForm() {
    setActiveId(null);
    setForm(EMPTY_FORM);
    setFormMode("new");
  }

  function openEditForm(id: string) {
    const device = devices.find((d) => d.id === id);
    if (!device) return;
    setActiveId(id);
    setForm(deviceToForm(device));
    setFormMode("edit");
  }

  function openViewForm(id: string) {
    const device = devices.find((d) => d.id === id);
    if (!device) return;
    setActiveId(id);
    setForm(deviceToForm(device));
    setFormMode("view");
  }

  function closeForm() {
    setFormMode(null);
    setActiveId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit() {
    if (!form.devicePhone) {
      notify.error("전화번호는 필수입니다.");
      return;
    }

    setSaving(true);
    const payload = formToPayload(form);

    try {
      const res = await fetch(
        formMode === "edit" && activeId ? `/api/phones/${activeId}` : "/api/phones",
        {
          method: formMode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "저장에 실패했습니다.");
      }

      notify.success(
        formMode === "edit" ? "휴대폰이 수정되었습니다." : "휴대폰이 추가되었습니다."
      );
      closeForm();
      await loadDevices();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 휴대폰을 삭제할까요?")) return;

    try {
      const res = await fetch(`/api/phones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify.success("휴대폰이 삭제되었습니다.");
      if (activeId === id) closeForm();
      await loadDevices();
    } catch {
      notify.error("삭제에 실패했습니다.");
    }
  }

  function handleReorder(next: PhoneDeviceData[]) {
    setDevices(next);
    setOrderDirty(true);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      const items = devices.map((d, index) => ({ id: d.id, sortOrder: index }));
      const res = await fetch("/api/phones/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error();
      notify.success("순서가 저장되었습니다.");
      setOrderDirty(false);
    } catch {
      notify.error("순서 저장에 실패했습니다.");
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-text-primary">휴대폰 관리</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            휴대폰·요금제·구매 정보 관리 · 드래그로 순서 변경
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <SearchBar value={globalQuery} onChange={setGlobalQuery} />
          </div>
          <Button onClick={openNewForm}>+ 휴대폰 추가</Button>
        </div>
      </div>

      {formMode && (
        <PhoneDeviceForm
          form={form}
          mode={formMode}
          saving={saving}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
          불러오는 중...
        </div>
      ) : (
        <PhoneDeviceTable
          devices={filteredDevices}
          activeId={activeId}
          orderDirty={orderDirty}
          savingOrder={savingOrder}
          dragDisabled={isSearching}
          onReorder={handleReorder}
          onSaveOrder={handleSaveOrder}
          onEdit={openEditForm}
          onView={openViewForm}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
