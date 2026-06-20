"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/layout/SearchBar";
import { useSearchStore } from "@/stores/searchStore";
import { notify } from "@/lib/notify";
import type { ChannelPreferencesData } from "@/lib/channel-preference-service";
import type { AdsenseAccountData } from "@/components/adsense/types";
import type { YoutubeAccountData } from "@/components/youtube/types";
import { CategoryCountrySettingsModal } from "./CategoryCountrySettingsModal";
import { ChannelForm } from "./ChannelForm";
import { ChannelTable } from "./ChannelTable";
import {
  EMPTY_FORM,
  channelToForm,
  formToPayload,
  type ChannelData,
  type ChannelFormState,
  type FormMode,
} from "./types";

const EMPTY_PREFERENCES: ChannelPreferencesData = {
  categories: [],
  countries: [],
  templates: [],
};

export function ChannelsView() {
  const globalQuery = useSearchStore((s) => s.query);
  const setGlobalQuery = useSearchStore((s) => s.setQuery);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [preferences, setPreferences] =
    useState<ChannelPreferencesData>(EMPTY_PREFERENCES);
  const [youtubeAccounts, setYoutubeAccounts] = useState<YoutubeAccountData[]>([]);
  const [adsenseAccounts, setAdsenseAccounts] = useState<AdsenseAccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ChannelFormState>(EMPTY_FORM);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [channelsRes, prefsRes, youtubeRes, adsenseRes] = await Promise.all([
        fetch("/api/channels"),
        fetch("/api/channels/preferences"),
        fetch("/api/youtube"),
        fetch("/api/adsense"),
      ]);

      if (!channelsRes.ok || !prefsRes.ok || !youtubeRes.ok || !adsenseRes.ok) {
        throw new Error();
      }

      const [channelsData, prefsData, youtubeData, adsenseData] = await Promise.all([
        channelsRes.json(),
        prefsRes.json(),
        youtubeRes.json(),
        adsenseRes.json(),
      ]);

      setChannels(channelsData);
      setPreferences(prefsData);
      setYoutubeAccounts(youtubeData);
      setAdsenseAccounts(adsenseData);
      setOrderDirty(false);
    } catch {
      notify.error("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const youtubeOptions = useMemo(
    () =>
      youtubeAccounts.map((a) => ({
        id: a.id,
        label: a.accountId,
      })),
    [youtubeAccounts]
  );

  const adsenseOptions = useMemo(
    () =>
      adsenseAccounts.map((a) => ({
        id: a.id,
        label: a.accountId,
      })),
    [adsenseAccounts]
  );

  const isSearching = globalQuery.trim().length > 0;

  const filteredChannels = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q) ||
        c.youtubeAccountLabel?.toLowerCase().includes(q) ||
        c.adsenseAccountLabel?.toLowerCase().includes(q)
    );
  }, [channels, globalQuery]);

  function openNewForm() {
    setActiveId(null);
    setForm(EMPTY_FORM);
    setFormMode("new");
  }

  function openEditForm(id: string) {
    const channel = channels.find((c) => c.id === id);
    if (!channel) return;
    setActiveId(id);
    setForm(channelToForm(channel));
    setFormMode("edit");
  }

  function openViewForm(id: string) {
    const channel = channels.find((c) => c.id === id);
    if (!channel) return;
    setActiveId(id);
    setForm(channelToForm(channel));
    setFormMode("view");
  }

  function closeForm() {
    setFormMode(null);
    setActiveId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit() {
    const handleValue = form.handle.trim();
    if (!form.name.trim() || !handleValue || handleValue === "@") {
      notify.error("채널명과 핸들명은 필수입니다.");
      return;
    }

    setSaving(true);
    const payload = formToPayload(form);

    try {
      const res = await fetch(
        formMode === "edit" && activeId ? `/api/channels/${activeId}` : "/api/channels",
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
        formMode === "edit" ? "채널이 수정되었습니다." : "채널이 추가되었습니다."
      );
      closeForm();
      await loadData();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function handleReorder(next: ChannelData[]) {
    setChannels(next);
    setOrderDirty(true);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      const items = channels.map((c, index) => ({ id: c.id, sortOrder: index }));
      const res = await fetch("/api/channels/reorder", {
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
    if (!window.confirm("이 채널을 삭제할까요?")) return;

    try {
      const res = await fetch(`/api/channels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify.success("채널이 삭제되었습니다.");
      if (activeId === id) closeForm();
      await loadData();
    } catch {
      notify.error("삭제에 실패했습니다.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-text-primary">채널 관리</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            채널 정보 · 유튜브/애드센스 연결 · 수창 관리
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="md:hidden">
            <SearchBar value={globalQuery} onChange={setGlobalQuery} />
          </div>
          <Button variant="ghost" onClick={() => setSettingsOpen(true)}>
            카테고리 템플릿 나라 설정
          </Button>
          <Button onClick={openNewForm}>+ 채널 추가</Button>
        </div>
      </div>

      {formMode && (
        <ChannelForm
          form={form}
          mode={formMode}
          saving={saving}
          categories={preferences.categories}
          countries={preferences.countries}
          templates={preferences.templates}
          youtubeAccounts={youtubeOptions}
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
        <ChannelTable
          channels={filteredChannels}
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

      <CategoryCountrySettingsModal
        open={settingsOpen}
        preferences={preferences}
        onClose={() => setSettingsOpen(false)}
        onSaved={(data) => setPreferences(data)}
      />
    </div>
  );
}
