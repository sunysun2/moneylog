"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/layout/SearchBar";
import { useSearchStore } from "@/stores/searchStore";
import { notify } from "@/lib/notify";
import { YoutubeAccountForm } from "./YoutubeAccountForm";
import { YoutubeAccountTable } from "./YoutubeAccountTable";
import {
  EMPTY_FORM,
  accountToForm,
  formToPayload,
  type FormMode,
  type YoutubeAccountData,
  type YoutubeAccountFormState,
} from "./types";
import type { AdsenseAccountData } from "@/components/adsense/types";

export function YoutubeAccountsView() {
  const globalQuery = useSearchStore((s) => s.query);
  const setGlobalQuery = useSearchStore((s) => s.setQuery);
  const [accounts, setAccounts] = useState<YoutubeAccountData[]>([]);
  const [adsenseAccounts, setAdsenseAccounts] = useState<AdsenseAccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<YoutubeAccountFormState>(EMPTY_FORM);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const [youtubeRes, adsenseRes] = await Promise.all([
        fetch("/api/youtube"),
        fetch("/api/adsense"),
      ]);
      if (!youtubeRes.ok) throw new Error();
      const data: YoutubeAccountData[] = await youtubeRes.json();
      setAccounts(data);
      if (adsenseRes.ok) {
        setAdsenseAccounts(await adsenseRes.json());
      }
      setOrderDirty(false);
    } catch {
      notify.error("계정 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  function findLinkedAdsenseId(account: YoutubeAccountData) {
    if (!account.adsenseAccount) return "";
    return (
      adsenseAccounts.find((item) => item.accountId === account.adsenseAccount)?.id ?? ""
    );
  }

  const adsenseOptions = useMemo(
    () =>
      adsenseAccounts.map((account) => ({
        id: account.id,
        label: account.accountId,
      })),
    [adsenseAccounts]
  );

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
        a.adsenseAccount?.toLowerCase().includes(q) ||
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
    setForm(accountToForm(account, findLinkedAdsenseId(account)));
    setFormMode("edit");
  }

  function openViewForm(id: string) {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    setActiveId(id);
    setForm(accountToForm(account, findLinkedAdsenseId(account)));
    setFormMode("view");
  }

  function closeForm() {
    setFormMode(null);
    setActiveId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(overrides?: Partial<YoutubeAccountFormState>) {
    const submitForm = { ...form, ...overrides };
    if (overrides) {
      setForm(submitForm);
    }

    if (!submitForm.accountId || !submitForm.password) {
      notify.error("계정 ID와 비밀번호는 필수입니다.");
      return;
    }

    setSaving(true);
    const payload = formToPayload(submitForm);

    try {
      const res = await fetch(
        formMode === "edit" && activeId
          ? `/api/youtube/${activeId}`
          : "/api/youtube",
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

      notify.success(formMode === "edit" ? "계정이 수정되었습니다." : "계정이 추가되었습니다.");
      closeForm();
      await loadAccounts();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function handleReorder(next: YoutubeAccountData[]) {
    setAccounts(next);
    setOrderDirty(true);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 계정을 삭제할까요?")) return;

    try {
      const res = await fetch(`/api/youtube/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify.success("계정이 삭제되었습니다.");
      if (activeId === id) closeForm();
      await loadAccounts();
    } catch {
      notify.error("삭제에 실패했습니다.");
    }
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      const items = accounts.map((a, index) => ({ id: a.id, sortOrder: index }));
      const res = await fetch("/api/youtube/reorder", {
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
          <h1 className="text-headline-md text-text-primary">유튜브 계정</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            계정 정보 관리 · 드래그로 순서 변경
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
        <YoutubeAccountForm
          form={form}
          mode={formMode}
          saving={saving}
          adsenseAccounts={adsenseOptions}
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
        <YoutubeAccountTable
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
