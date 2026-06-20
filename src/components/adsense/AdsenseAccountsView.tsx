"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/layout/SearchBar";
import { useSearchStore } from "@/stores/searchStore";
import { notify } from "@/lib/notify";
import { AdsenseAccountForm } from "./AdsenseAccountForm";
import { AdsenseAccountTable } from "./AdsenseAccountTable";
import {
  EMPTY_FORM,
  accountToForm,
  formToPayload,
  type AdsenseAccountData,
  type AdsenseAccountFormState,
  type FormMode,
} from "./types";

export function AdsenseAccountsView() {
  const globalQuery = useSearchStore((s) => s.query);
  const setGlobalQuery = useSearchStore((s) => s.setQuery);
  const [accounts, setAccounts] = useState<AdsenseAccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<AdsenseAccountFormState>(EMPTY_FORM);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/adsense");
      if (!res.ok) throw new Error();
      const data: AdsenseAccountData[] = await res.json();
      setAccounts(data);
      setOrderDirty(false);
    } catch {
      notify.error("계정 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const isSearching = globalQuery.trim().length > 0;

  const filteredAccounts = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.accountId.toLowerCase().includes(q) ||
        a.holderName?.toLowerCase().includes(q) ||
        a.youtubeAccount?.toLowerCase().includes(q) ||
        a.channelName?.toLowerCase().includes(q) ||
        a.bank?.toLowerCase().includes(q) ||
        a.phone?.includes(q)
    );
  }, [accounts, globalQuery]);

  function openNewForm() {
    setActiveId(null);
    setForm(EMPTY_FORM);
    setFormMode("new");
  }

  function openEditForm(id: string) {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    setActiveId(id);
    setForm(accountToForm(account));
    setFormMode("edit");
  }

  function openViewForm(id: string) {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    setActiveId(id);
    setForm(accountToForm(account));
    setFormMode("view");
  }

  function closeForm() {
    setFormMode(null);
    setActiveId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit() {
    if (!form.accountId || !form.password) {
      notify.error("계정 ID와 비밀번호는 필수입니다.");
      return;
    }

    setSaving(true);
    const payload = formToPayload(form);

    try {
      const res = await fetch(
        formMode === "edit" && activeId
          ? `/api/adsense/${activeId}`
          : "/api/adsense",
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

      const saved: AdsenseAccountData = await res.json();
      notify.success(
        formMode === "edit" ? "계정이 수정되었습니다." : "계정이 추가되었습니다."
      );

      if (saved.linkedYoutubeAccountId && formMode === "new") {
        notify.success("유튜브 계정과 자동 연동되었습니다.");
      }

      closeForm();
      await loadAccounts();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function handleReorder(next: AdsenseAccountData[]) {
    setAccounts(next);
    setOrderDirty(true);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      const items = accounts.map((a, index) => ({ id: a.id, sortOrder: index }));
      const res = await fetch("/api/adsense/reorder", {
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

  async function handleDelete(id: string) {
    if (!window.confirm("이 계정을 삭제할까요?")) return;

    try {
      const res = await fetch(`/api/adsense/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify.success("계정이 삭제되었습니다.");
      if (activeId === id) closeForm();
      await loadAccounts();
    } catch {
      notify.error("삭제에 실패했습니다.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-text-primary">애드센스 계정</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            애드센스 계정 정보 관리 · 드래그로 순서 변경
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <SearchBar value={globalQuery} onChange={setGlobalQuery} />
          </div>
          <Button onClick={openNewForm}>+ 계정 추가</Button>
        </div>
      </div>

      {formMode && (
        <AdsenseAccountForm
          form={form}
          mode={formMode}
          saving={saving}
          formKey={activeId ?? "new"}
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
        <AdsenseAccountTable
          accounts={filteredAccounts}
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
