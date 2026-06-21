"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/layout/SearchBar";
import { useSearchStore } from "@/stores/searchStore";
import { notify } from "@/lib/notify";
import { FreelancerForm } from "./FreelancerForm";
import { FreelancerExpenseLookup } from "./FreelancerExpenseLookup";
import { FreelancerTable } from "./FreelancerTable";
import {
  EMPTY_FORM,
  freelancerToForm,
  formToPayload,
  type FormMode,
  type FreelancerData,
  type FreelancerFormState,
} from "./types";

export function FreelancersView() {
  const globalQuery = useSearchStore((s) => s.query);
  const setGlobalQuery = useSearchStore((s) => s.setQuery);
  const [freelancers, setFreelancers] = useState<FreelancerData[]>([]);
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FreelancerFormState>(EMPTY_FORM);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [saving, setSaving] = useState(false);

  const loadFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/freelancers");
      if (!res.ok) throw new Error();
      const data: FreelancerData[] = await res.json();
      setFreelancers(data);
    } catch {
      notify.error("프리랜서 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/channels");
      if (!res.ok) throw new Error();
      const channels: { name: string }[] = await res.json();
      const names = [
        ...new Set(channels.map((channel) => channel.name.trim()).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b, "ko"));
      setChannelNames(names);
    } catch {
      setChannelNames([]);
    }
  }, []);

  useEffect(() => {
    loadFreelancers();
    loadChannels();
  }, [loadFreelancers, loadChannels]);

  const filteredFreelancers = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return freelancers;
    return freelancers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.phone?.includes(q) ||
        f.kakaoId?.toLowerCase().includes(q) ||
        f.bank?.toLowerCase().includes(q) ||
        f.channel?.toLowerCase().includes(q)
    );
  }, [freelancers, globalQuery]);

  function openNewForm() {
    setActiveId(null);
    setForm(EMPTY_FORM);
    setFormMode("new");
  }

  function openEditForm(id: string) {
    const freelancer = freelancers.find((f) => f.id === id);
    if (!freelancer) return;
    setActiveId(id);
    setForm(freelancerToForm(freelancer));
    setFormMode("edit");
  }

  function openViewForm(id: string) {
    const freelancer = freelancers.find((f) => f.id === id);
    if (!freelancer) return;
    setActiveId(id);
    setForm(freelancerToForm(freelancer));
    setFormMode("view");
  }

  function closeForm() {
    setFormMode(null);
    setActiveId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(overrides?: Partial<FreelancerFormState>) {
    const submitForm = { ...form, ...overrides };
    if (overrides) {
      setForm(submitForm);
    }

    if (!submitForm.name.trim()) {
      notify.error("이름은 필수입니다.");
      return;
    }

    setSaving(true);
    const payload = formToPayload(submitForm);

    try {
      const res = await fetch(
        formMode === "edit" && activeId ? `/api/freelancers/${activeId}` : "/api/freelancers",
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
        formMode === "edit" ? "프리랜서가 수정되었습니다." : "프리랜서가 등록되었습니다."
      );
      closeForm();
      await loadFreelancers();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 프리랜서를 삭제할까요?")) return;

    try {
      const res = await fetch(`/api/freelancers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify.success("프리랜서가 삭제되었습니다.");
      if (activeId === id) closeForm();
      await loadFreelancers();
    } catch {
      notify.error("삭제에 실패했습니다.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-text-primary">프리랜서 관리</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            프리랜서 연락처·계좌·NAS 정보 관리
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <SearchBar value={globalQuery} onChange={setGlobalQuery} />
          </div>
          <Button onClick={openNewForm}>+ 프리랜서 등록</Button>
        </div>
      </div>

      {formMode && (
        <FreelancerForm
          form={form}
          mode={formMode}
          saving={saving}
          channelNames={channelNames}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      <FreelancerExpenseLookup freelancers={freelancers} />

      {loading ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
          불러오는 중...
        </div>
      ) : (
        <FreelancerTable
          freelancers={filteredFreelancers}
          activeId={activeId}
          onEdit={openEditForm}
          onView={openViewForm}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
