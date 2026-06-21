"use client";

import { useEffect, useMemo } from "react";
import { formatKoreanPhone, finalizeKoreanPhoneInput, finalizeKoreanPhoneOnSave } from "@/lib/phone-format";
import { Button, Input, Select } from "@/components/ui";
import { SensitiveData } from "@/components/ui/SensitiveData";
import {
  EMPTY_FORM,
  type FormMode,
  type FreelancerFormState,
} from "./types";

interface FreelancerFormProps {
  form: FreelancerFormState;
  mode: FormMode;
  saving: boolean;
  channelNames: string[];
  onChange: (patch: Partial<FreelancerFormState>) => void;
  onSubmit: (overrides?: Partial<FreelancerFormState>) => void;
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
  new: "프리랜서 등록",
  edit: "프리랜서 수정",
  view: "프리랜서 보기",
};

export function FreelancerForm({
  form,
  mode,
  saving,
  channelNames,
  onChange,
  onSubmit,
  onCancel,
}: FreelancerFormProps) {
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

  const channelOptions = useMemo(() => {
    const options = [{ value: "", label: "채널 선택" }];
    for (const name of channelNames) {
      options.push({ value: name, label: name });
    }
    if (form.channel && !channelNames.includes(form.channel)) {
      options.push({ value: form.channel, label: form.channel });
    }
    return options;
  }, [channelNames, form.channel]);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    onSubmit({ phone: finalizeKoreanPhoneOnSave(form.phone) });
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
            <Input
              label="이름"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="홍길동"
              required
              {...fieldProps}
            />
            {readOnly ? (
              <div className="space-y-1.5">
                <p className="text-label-caps text-on-surface-variant">전화번호</p>
                <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
                  <SensitiveData>{form.phone || "—"}</SensitiveData>
                </div>
              </div>
            ) : (
              <Input
                label="전화번호"
                value={form.phone}
                onChange={(e) =>
                  onChange({ phone: formatKoreanPhone(e.target.value) })
                }
                onBlur={() => onChange({ phone: finalizeKoreanPhoneInput(form.phone) })}
                placeholder="010-0000-0000"
                sensitive
                copyable
              />
            )}
            <Input
              label="카톡 ID"
              value={form.kakaoId}
              onChange={(e) => onChange({ kakaoId: e.target.value })}
              placeholder="kakao_id"
              {...fieldProps}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon="🏦">계좌 정보</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="은행"
              value={form.bank}
              onChange={(e) => onChange({ bank: e.target.value })}
              placeholder="국민은행"
              {...fieldProps}
            />
            {readOnly ? (
              <div className="space-y-1.5">
                <p className="text-label-caps text-on-surface-variant">계좌번호</p>
                <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
                  <SensitiveData>{form.accountNumber || "—"}</SensitiveData>
                </div>
              </div>
            ) : (
              <Input
                label="계좌번호"
                value={form.accountNumber}
                onChange={(e) => onChange({ accountNumber: e.target.value })}
                placeholder="000-00-000000"
                sensitive
                copyable
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon="📺">담당 채널</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {readOnly ? (
              <ReadOnlyField label="채널" value={form.channel} />
            ) : (
              <Select
                label="채널"
                value={form.channel}
                onChange={(e) => onChange({ channel: e.target.value })}
                options={channelOptions}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon="💾">NAS</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {readOnly ? (
              <>
                <div className="space-y-1.5">
                  <p className="text-label-caps text-on-surface-variant">NAS ID</p>
                  <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
                    <SensitiveData>{form.nasId || "—"}</SensitiveData>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-label-caps text-on-surface-variant">NAS 비밀번호</p>
                  <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
                    <SensitiveData>{form.nasPassword || "—"}</SensitiveData>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Input
                  label="NAS ID"
                  value={form.nasId}
                  onChange={(e) => onChange({ nasId: e.target.value })}
                  sensitive
                  copyable
                />
                <Input
                  label="NAS 비밀번호"
                  type="password"
                  value={form.nasPassword}
                  onChange={(e) => onChange({ nasPassword: e.target.value })}
                  sensitive
                  copyable
                />
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            {readOnly ? "닫기" : "취소"}
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={saving}>
              {saving ? "저장 중..." : mode === "new" ? "등록 완료" : "수정 완료"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
