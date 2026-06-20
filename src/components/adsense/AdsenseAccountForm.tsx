"use client";

import { useEffect } from "react";
import { notify } from "@/lib/notify";
import { formatKoreanPhone } from "@/lib/phone-format";
import { formatKoreanShortDateInput } from "@/lib/korean-short-date-format";
import { Button, Input, Select, Textarea, Badge } from "@/components/ui";
import { SensitiveData } from "@/components/ui/SensitiveData";
import { OtpUsageToggle, OtpUsageBadge } from "@/components/youtube/OtpUsageToggle";
import type { AccountStatus } from "@/models/AdsenseAccount";
import type { AdsenseAccountFormState, FormMode } from "./types";
import { youtubeLinksToFormPatch, MAX_LINKED_YOUTUBE_ACCOUNTS } from "./types";

interface AdsenseAccountFormProps {
  form: AdsenseAccountFormState;
  mode: FormMode;
  saving: boolean;
  formKey: string;
  onChange: (patch: Partial<AdsenseAccountFormState>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-body-sm font-semibold text-text-primary">
      <span className="text-primary">{icon}</span>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-label-caps text-on-surface-variant">{label}</p>
      <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5 text-body-sm text-text-primary">
        {value || "—"}
      </div>
    </div>
  );
}

const TITLE_MAP: Record<FormMode, string> = {
  new: "애드센스 계정 추가",
  edit: "애드센스 계정 수정",
  view: "애드센스 계정 보기",
};

const STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "활성" },
  { value: "pending", label: "대기" },
  { value: "warning", label: "경고" },
  { value: "inactive", label: "비활성" },
  { value: "deleted", label: "삭제" },
];

export function AdsenseAccountForm({
  form,
  mode,
  saving,
  formKey,
  onChange,
  onSubmit,
  onCancel,
}: AdsenseAccountFormProps) {
  const readOnly = mode === "view";
  const linkedCount = form.linkedYoutubeAccounts.length;
  const isYoutubeLinked = linkedCount > 0;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, saving]);

  async function syncYoutubeLink(options?: { silent?: boolean }) {
    if (readOnly) return;

    const accountId = form.accountId.trim();

    if (!accountId) {
      onChange({
        linkedYoutubeAccountId: "",
        linkedYoutubeAccounts: [],
        youtubeAccount: "",
        channelName: "",
      });
      return;
    }

    const params = new URLSearchParams();
    params.set("accountId", accountId);

    try {
      const res = await fetch(`/api/adsense/youtube-link?${params.toString()}`);
      if (!res.ok) return;

      const data = await res.json();
      if (!data.linked || !Array.isArray(data.links) || data.links.length === 0) {
        onChange({
          linkedYoutubeAccountId: "",
          linkedYoutubeAccounts: [],
          youtubeAccount: "",
          channelName: "",
        });
        return;
      }

      onChange(youtubeLinksToFormPatch(data.links));

      if (!options?.silent) {
        notify.success(
          `유튜브 계정 ${data.links.length}개 연동 정보를 불러왔습니다.`
        );
      }
    } catch {
      // 연동 실패는 조용히 무시
    }
  }

  useEffect(() => {
    if (readOnly) return;
    void syncYoutubeLink({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, readOnly]);

  async function handleAccountIdBlur() {
    if (readOnly || !form.accountId.trim()) return;
    await syncYoutubeLink();
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!readOnly) onSubmit();
  }

  const fieldProps = readOnly ? { disabled: true, readOnly: true } : {};

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-on-surface-variant"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <h2 className="text-body-lg font-semibold text-text-primary">
            {TITLE_MAP[mode]}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-text-primary"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6 p-5">
        <div className="space-y-4">
          <SectionTitle icon="👤">기본 정보</SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            {readOnly ? (
              <ReadOnlyField label="계정 ID" value={form.accountId} />
            ) : (
              <Input
                label="계정 ID"
                value={form.accountId}
                onChange={(e) => onChange({ accountId: e.target.value })}
                onBlur={handleAccountIdBlur}
                placeholder="creator@example.com"
                sensitive
              />
            )}
            {readOnly ? (
              <div className="space-y-1.5">
                <p className="text-label-caps text-on-surface-variant">비밀번호</p>
                <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
                  <SensitiveData>{form.password || "—"}</SensitiveData>
                </div>
              </div>
            ) : (
              <Input
                label="비밀번호"
                type="password"
                showToggle
                value={form.password}
                onChange={(e) => onChange({ password: e.target.value })}
                sensitive
              />
            )}
            <Input
              label="명의자"
              value={form.holderName}
              onChange={(e) => onChange({ holderName: e.target.value })}
              {...fieldProps}
            />
            <Select
              label="계정 상태"
              value={form.status}
              onChange={(e) =>
                onChange({ status: e.target.value as AccountStatus })
              }
              options={STATUS_OPTIONS}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon="▶">연동된 유튜브 계정</SectionTitle>
            <Badge variant={isYoutubeLinked ? "success" : "muted"}>
              {linkedCount}/{MAX_LINKED_YOUTUBE_ACCOUNTS} 연동
            </Badge>
          </div>

          {linkedCount === 0 ? (
            <div className="rounded-lg border border-dashed border-border-subtle bg-surface-container-lowest px-4 py-6 text-body-sm text-text-muted">
              {form.accountId.trim()
                ? "유튜브 탭에서 이 애드센스 계정을 선택한 유튜브 계정이 없습니다."
                : "계정 ID를 입력하면 유튜브 탭과 연동된 계정을 불러옵니다."}
            </div>
          ) : (
            <div className="space-y-3">
              {form.linkedYoutubeAccounts.map((entry, index) => (
                <div
                  key={entry.youtubeAccountId}
                  className="rounded-lg border border-border-subtle bg-surface-container-lowest p-4"
                >
                  <p className="mb-3 text-label-caps text-on-surface-variant">
                    연동 {index + 1}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {readOnly ? (
                      <ReadOnlyField label="유튜브 계정" value={entry.youtubeAccount} />
                    ) : (
                      <Input
                        label="유튜브 계정"
                        value={entry.youtubeAccount}
                        sensitive
                        copyable
                        disabled
                        readOnly
                      />
                    )}
                    {readOnly ? (
                      <ReadOnlyField label="채널명" value={entry.channelName} />
                    ) : (
                      <Input
                        label="채널명"
                        value={entry.channelName}
                        disabled
                        readOnly
                        placeholder="유튜브 탭에서 불러옴"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <SectionTitle icon="🏦">애드센스·은행 정보</SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="은행"
              value={form.bank}
              onChange={(e) => onChange({ bank: e.target.value })}
              {...fieldProps}
            />
            <Input
              label="계좌번호"
              value={form.accountNumber}
              onChange={(e) => onChange({ accountNumber: e.target.value })}
              sensitive={!readOnly}
              copyable={!readOnly}
              {...fieldProps}
            />
            <Input
              label="전화번호"
              value={form.phone}
              onChange={(e) => onChange({ phone: formatKoreanPhone(e.target.value) })}
              placeholder="010-0000-0000"
              sensitive={!readOnly}
              {...fieldProps}
            />
            <Input
              label="주소"
              value={form.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className="md:col-span-2"
              sensitive={!readOnly}
              {...fieldProps}
            />
            <Input
              label="신청일"
              value={form.appliedDate}
              onChange={(e) =>
                onChange({ appliedDate: formatKoreanShortDateInput(e.target.value) })
              }
              placeholder="25년. 06월. 19일"
              inputMode="numeric"
              {...fieldProps}
            />
            <Input
              label="도착일"
              value={form.arrivedDate}
              onChange={(e) =>
                onChange({ arrivedDate: formatKoreanShortDateInput(e.target.value) })
              }
              placeholder="25년. 06월. 19일"
              inputMode="numeric"
              {...fieldProps}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon="🔐">OTP 설정</SectionTitle>
            <div className="space-y-1.5">
              <p className="text-label-caps text-on-surface-variant">OTP 사용</p>
              {readOnly ? (
                <OtpUsageBadge value={form.otpInUse} />
              ) : (
                <OtpUsageToggle
                  value={form.otpInUse}
                  onChange={(otpInUse) => onChange({ otpInUse })}
                />
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {readOnly ? (
              <Input
                label="OTP 앱"
                value={form.otpApp}
                sensitive
                readOnly
                disabled={!form.otpInUse}
              />
            ) : (
              <Input
                label="OTP 앱"
                value={form.otpApp}
                onChange={(e) => onChange({ otpApp: e.target.value })}
                sensitive
                disabled={!form.otpInUse}
              />
            )}
            {readOnly ? (
              <Input
                label="OTP 문자"
                value={form.otpSms}
                sensitive
                copyable
                readOnly
                disabled={!form.otpInUse}
              />
            ) : (
              <Input
                label="OTP 문자"
                value={form.otpSms}
                onChange={(e) => onChange({ otpSms: e.target.value })}
                sensitive
                disabled={!form.otpInUse}
              />
            )}
            <Textarea
              label="OTP 백업 코드"
              value={form.otpBackup}
              onChange={(e) => onChange({ otpBackup: e.target.value })}
              placeholder="백업 코드를 입력하세요"
              className="font-data-mono text-text-primary md:col-span-3"
              disabled={readOnly || !form.otpInUse}
              readOnly={readOnly}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            {readOnly ? "닫기" : "취소"}
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={saving}>
              {saving ? "저장 중..." : mode === "new" ? "추가 완료" : "수정 완료"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
