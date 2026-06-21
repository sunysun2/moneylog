"use client";

import { useEffect } from "react";
import { USD_TO_KRW_RATE, usdToKrw } from "@/lib/exchange";
import { formatKoreanPhone, finalizeKoreanPhoneInput, finalizeKoreanPhoneOnSave } from "@/lib/phone-format";
import { formatKoreanShortDateInput } from "@/lib/korean-short-date-format";
import { notify } from "@/lib/notify";
import {
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import type { FormMode, YoutubeAccountFormState } from "./types";
import {
  adsenseLinkToYoutubeFormPatch,
  clearAdsenseLinkPatch,
} from "./types";
import type { AccountStatus } from "@/models/YoutubeAccount";
import { UsageStatusBadge, syncIsInUseWithStatus } from "./UsageStatusBadge";
import { OtpUsageToggle, OtpUsageBadge } from "./OtpUsageToggle";
import { SensitiveData } from "@/components/ui/SensitiveData";

interface LinkOption {
  id: string;
  label: string;
}

interface YoutubeAccountFormProps {
  form: YoutubeAccountFormState;
  mode: FormMode;
  saving: boolean;
  adsenseAccounts: LinkOption[];
  onChange: (patch: Partial<YoutubeAccountFormState>) => void;
  onSubmit: (overrides?: Partial<YoutubeAccountFormState>) => void;
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

function handleStatusChange(
  status: AccountStatus,
  onChange: (patch: Partial<YoutubeAccountFormState>) => void
) {
  onChange({
    status,
    isInUse: syncIsInUseWithStatus(status),
  });
}

const TITLE_MAP: Record<FormMode, string> = {
  new: "계정 정보 추가",
  edit: "계정 정보 수정",
  view: "계정 정보 보기",
};

export function YoutubeAccountForm({
  form,
  mode,
  saving,
  adsenseAccounts,
  onChange,
  onSubmit,
  onCancel,
}: YoutubeAccountFormProps) {
  const readOnly = mode === "view";

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, saving]);

  async function handleAdsenseAccountChange(adsenseAccountId: string) {
    if (readOnly) return;

    if (!adsenseAccountId) {
      onChange(clearAdsenseLinkPatch());
      return;
    }

    try {
      const res = await fetch(
        `/api/youtube/adsense-link?adsenseAccountId=${encodeURIComponent(adsenseAccountId)}`
      );
      if (!res.ok) return;

      const data = await res.json();
      if (!data.linked) {
        onChange(clearAdsenseLinkPatch());
        return;
      }

      onChange(adsenseLinkToYoutubeFormPatch(data));
      notify.success("애드센스 계정 정보를 불러왔습니다.");
    } catch {
      // 연동 실패는 조용히 무시
    }
  }

  function handleUsdChange(value: string) {
    if (readOnly) return;
    if (value && !Number.isNaN(Number(value))) {
      const krw = usdToKrw(Number(value));
      onChange({ priceUsd: value, priceKrw: String(krw) });
      notify.currency(
        `실시간 환율(${USD_TO_KRW_RATE.toLocaleString()}원)이 적용되었습니다.`
      );
    } else {
      onChange({ priceUsd: value });
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    onSubmit({ phone: finalizeKoreanPhoneOnSave(form.phone) });
  }

  const fieldProps = readOnly ? { disabled: true, readOnly: true } : {};
  const adsenseOptions = [
    { value: "", label: "선택 안 함" },
    ...adsenseAccounts.map((account) => ({ value: account.id, label: account.label })),
  ];

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
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
        <div className="grid gap-4 md:grid-cols-3">
          {readOnly ? (
            <Input
              label="계정 ID (이메일)"
              value={form.accountId}
              sensitive
              copyable
              readOnly
              disabled
            />
          ) : (
            <Input
              label="계정 ID (이메일)"
              value={form.accountId}
              onChange={(e) => onChange({ accountId: e.target.value })}
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
          {readOnly ? (
            <ReadOnlyField
              label="생성 방법"
              value={form.origin === "created" ? "생성" : "구매"}
            />
          ) : (
            <Select
              label="생성 방법"
              value={form.origin}
              onChange={(e) =>
                onChange({ origin: e.target.value as YoutubeAccountFormState["origin"] })
              }
              options={[
                { value: "created", label: "생성" },
                { value: "purchased", label: "구매" },
              ]}
            />
          )}
        </div>

        <div className="space-y-4">
          <SectionTitle icon="🛡">애드센스 및 보안 설정</SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            {readOnly ? (
              <ReadOnlyField label="애드센스 계정" value={form.adsenseAccount} />
            ) : (
              <Select
                label="애드센스 계정"
                value={form.linkedAdsenseAccountId}
                onChange={(e) => handleAdsenseAccountChange(e.target.value)}
                options={adsenseOptions}
              />
            )}
            <Input
              label="전화번호"
              value={form.phone}
              onChange={(e) => onChange({ phone: formatKoreanPhone(e.target.value) })}
              onBlur={() => onChange({ phone: finalizeKoreanPhoneInput(form.phone) })}
              placeholder="010-0000-0000"
              sensitive={!readOnly}
              disabled={readOnly || Boolean(form.linkedAdsenseAccountId)}
              {...(readOnly || form.linkedAdsenseAccountId ? { readOnly: true } : {})}
            />
            {readOnly ? (
              <ReadOnlyField label="채널명" value={form.channelName} />
            ) : (
              <Input
                label="채널명"
                value={form.channelName}
                onChange={(e) => onChange({ channelName: e.target.value })}
                {...fieldProps}
              />
            )}
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
                  disabled={Boolean(form.linkedAdsenseAccountId)}
                />
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="애드센스 상태"
              value={form.adsenseStatus}
              onChange={(e) =>
                onChange({
                  adsenseStatus: e.target.value as YoutubeAccountFormState["adsenseStatus"],
                })
              }
              options={[
                { value: "linked", label: "연결됨" },
                { value: "pending", label: "승인 대기" },
                { value: "unlinked", label: "미연결" },
              ]}
              disabled={readOnly || Boolean(form.linkedAdsenseAccountId)}
            />
            {readOnly ? (
              <Input
                label="OTP Key"
                value={form.otpKey}
                sensitive
                copyable
                readOnly
                disabled={!form.otpInUse}
              />
            ) : (
              <Input
                label="OTP Key"
                value={form.otpKey}
                onChange={(e) => onChange({ otpKey: e.target.value })}
                sensitive
                disabled={!form.otpInUse || Boolean(form.linkedAdsenseAccountId)}
                readOnly={Boolean(form.linkedAdsenseAccountId)}
              />
            )}
          </div>
          <Textarea
            label="OTP 백업 코드"
            value={form.otpBackup}
            onChange={(e) => onChange({ otpBackup: e.target.value })}
            placeholder="백업 코드를 입력하세요"
            className="font-data-mono text-text-primary"
            disabled={readOnly || !form.otpInUse || Boolean(form.linkedAdsenseAccountId)}
            readOnly={readOnly || Boolean(form.linkedAdsenseAccountId)}
          />
        </div>

        {form.origin === "created" ? (
          <div className="space-y-4 border-t border-border-subtle pt-4">
            <SectionTitle icon="📅">생성 상세 정보</SectionTitle>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="생성 날짜"
                value={form.createdDate}
                onChange={(e) =>
                  onChange({ createdDate: formatKoreanShortDateInput(e.target.value) })
                }
                placeholder="25년. 06월. 19일"
                inputMode="numeric"
                {...fieldProps}
              />
              <Select
                label="계정 상태"
                value={form.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as AccountStatus, onChange)
                }
                options={[
                  { value: "active", label: "활성" },
                  { value: "warning", label: "검토/경고" },
                  { value: "inactive", label: "비활성" },
                  { value: "deleted", label: "삭제" },
                ]}
                disabled={readOnly}
              />
              <UsageStatusBadge status={form.status} isInUse={form.isInUse} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 border-t border-border-subtle pt-4">
            <SectionTitle icon="🛒">구매 상세 정보</SectionTitle>
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="구매처" value={form.purchaseSource} onChange={(e) => onChange({ purchaseSource: e.target.value })} {...fieldProps} />
              <Input label="판매자" value={form.seller} onChange={(e) => onChange({ seller: e.target.value })} {...fieldProps} />
              <Input label="가격 (USD)" type="number" value={form.priceUsd} onChange={(e) => handleUsdChange(e.target.value)} {...fieldProps} />
              <Input label="가격 (KRW)" type="number" value={form.priceKrw} onChange={(e) => onChange({ priceKrw: e.target.value })} {...fieldProps} />
              <Input label="구매일" type="date" value={form.purchaseDate} onChange={(e) => onChange({ purchaseDate: e.target.value })} {...fieldProps} />
              <Input label="생성일" type="date" value={form.accountCreatedDate} onChange={(e) => onChange({ accountCreatedDate: e.target.value })} {...fieldProps} />
              <Select
                label="계정 상태"
                value={form.status}
                onChange={(e) => handleStatusChange(e.target.value as AccountStatus, onChange)}
                options={[
                  { value: "active", label: "활성" },
                  { value: "warning", label: "검토/경고" },
                  { value: "inactive", label: "비활성" },
                  { value: "deleted", label: "삭제" },
                ]}
                disabled={readOnly}
              />
              <UsageStatusBadge status={form.status} isInUse={form.isInUse} />
            </div>
          </div>
        )}

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
