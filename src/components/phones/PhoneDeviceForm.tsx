"use client";

import { useEffect } from "react";
import { formatKoreanPhone, finalizeKoreanPhoneInput, finalizeKoreanPhoneOnSave } from "@/lib/phone-format";
import { formatKoreanShortDateInput } from "@/lib/korean-short-date-format";
import { Button, Input, Select } from "@/components/ui";
import { SensitiveData } from "@/components/ui/SensitiveData";
import {
  MOBILE_CARRIER_OPTIONS,
  PAYMENT_DAY_OPTIONS,
  type FormMode,
  type PhoneDeviceFormState,
} from "./types";

interface PhoneDeviceFormProps {
  form: PhoneDeviceFormState;
  mode: FormMode;
  saving: boolean;
  onChange: (patch: Partial<PhoneDeviceFormState>) => void;
  onSubmit: (overrides?: Partial<PhoneDeviceFormState>) => void;
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
  new: "휴대폰 추가",
  edit: "휴대폰 수정",
  view: "휴대폰 보기",
};

const CARRIER_SELECT_OPTIONS = [
  { value: "", label: "선택" },
  ...MOBILE_CARRIER_OPTIONS,
];

const PAYMENT_DAY_SELECT_OPTIONS = [
  { value: "", label: "선택" },
  ...PAYMENT_DAY_OPTIONS,
];

export function PhoneDeviceForm({
  form,
  mode,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: PhoneDeviceFormProps) {
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

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    onSubmit({ devicePhone: finalizeKoreanPhoneOnSave(form.devicePhone) });
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
            <rect x="7" y="3" width="10" height="18" rx="2" />
            <path d="M11 18h2" />
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
          <SectionTitle icon="📱">휴대폰 정보</SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            {readOnly ? (
              <div className="space-y-1.5">
                <p className="text-label-caps text-on-surface-variant">전화번호</p>
                <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
                  <SensitiveData>{form.devicePhone || "—"}</SensitiveData>
                </div>
              </div>
            ) : (
              <Input
                label="전화번호"
                value={form.devicePhone}
                onChange={(e) =>
                  onChange({ devicePhone: formatKoreanPhone(e.target.value) })
                }
                onBlur={() =>
                  onChange({ devicePhone: finalizeKoreanPhoneInput(form.devicePhone) })
                }
                placeholder="010-0000-0000"
                sensitive
                copyable
              />
            )}
            <Input
              label="휴대폰 모델"
              value={form.phoneModel}
              onChange={(e) => onChange({ phoneModel: e.target.value })}
              placeholder="Galaxy S24 / iPhone 15"
              {...fieldProps}
            />
            {readOnly ? (
              <ReadOnlyField label="통신사" value={form.mobileCarrier} />
            ) : (
              <Select
                label="통신사"
                value={form.mobileCarrier}
                onChange={(e) => onChange({ mobileCarrier: e.target.value })}
                options={CARRIER_SELECT_OPTIONS}
              />
            )}
            <Input
              label="알뜰폰 사업자"
              value={form.mvnoProvider}
              onChange={(e) => onChange({ mvnoProvider: e.target.value })}
              placeholder="티플러스 / 헬로모바일 등"
              {...fieldProps}
            />
            <Input
              label="통신요금"
              value={form.mobilePlan}
              onChange={(e) => onChange({ mobilePlan: e.target.value })}
              placeholder="월 39,000원"
              {...fieldProps}
            />
            <Input
              label="요금제"
              value={form.ratePlan}
              onChange={(e) => onChange({ ratePlan: e.target.value })}
              placeholder="5G 프리미엄 / LTE 베이직"
              {...fieldProps}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon="🛒">구매 정보</SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="구매처"
              value={form.purchaseSource}
              onChange={(e) => onChange({ purchaseSource: e.target.value })}
              {...fieldProps}
            />
            <Input
              label="휴대폰 가격"
              type="number"
              value={form.priceKrw}
              onChange={(e) => onChange({ priceKrw: e.target.value })}
              {...fieldProps}
            />
            <Input
              label="구매일"
              value={form.purchaseDate}
              onChange={(e) =>
                onChange({ purchaseDate: formatKoreanShortDateInput(e.target.value) })
              }
              placeholder="25년. 06월. 19일"
              inputMode="numeric"
              {...fieldProps}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon="🏦">결제 정보</SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="은행 / 카드"
              value={form.bank}
              onChange={(e) => onChange({ bank: e.target.value })}
              {...fieldProps}
            />
            {readOnly ? (
              <ReadOnlyField
                label="결제일"
                value={form.paymentDay ? `매월 ${form.paymentDay}일` : ""}
              />
            ) : (
              <Select
                label="결제일"
                value={form.paymentDay}
                onChange={(e) => onChange({ paymentDay: e.target.value })}
                options={PAYMENT_DAY_SELECT_OPTIONS}
              />
            )}
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
