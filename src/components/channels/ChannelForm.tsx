"use client";

import { useEffect } from "react";
import { USD_TO_KRW_RATE, usdToKrw } from "@/lib/exchange";
import { notify } from "@/lib/notify";
import { formatYoutubeHandle } from "@/lib/handle-format";
import { formatKoreanShortDateInput } from "@/lib/korean-short-date-format";
import { cn } from "@/lib/cn";
import { Button, Input, Select } from "@/components/ui";
import type { ChannelStatus, ContentFormat, MonetizationType } from "@/models/Channel";
import { getContentFormatButtonClassName } from "./ContentFormatBadge";
import type { ChannelFormState, FormMode } from "./types";

interface LinkOption {
  id: string;
  label: string;
}

interface ChannelFormProps {
  form: ChannelFormState;
  mode: FormMode;
  saving: boolean;
  categories: string[];
  countries: string[];
  templates: string[];
  youtubeAccounts: LinkOption[];
  adsenseAccounts: LinkOption[];
  onChange: (patch: Partial<ChannelFormState>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-body-sm font-semibold text-text-primary">
      <span className="text-primary">{icon}</span>
      {children}
    </div>
  );
}

const GHOST_BUTTON_CLASS =
  "border border-border-subtle bg-transparent text-on-surface hover:bg-surface-container-high";

function OptionButtons<T extends string>({
  label,
  value,
  options,
  onChange,
  readOnly,
  className,
  getSelectedClassName,
}: {
  label: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  readOnly?: boolean;
  className?: string;
  getSelectedClassName?: (option: T) => string;
}) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "—";

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-label-caps text-on-surface-variant">{label}</p>
      {readOnly ? (
        <div className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5 text-body-sm text-text-primary">
          {selectedLabel}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-body-sm font-semibold transition focus-ring-primary",
                  selected
                    ? getSelectedClassName?.(option.value) ??
                        "bg-primary-container text-text-primary glow-primary"
                    : GHOST_BUTTON_CLASS
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContentFormatButtons({
  value,
  onChange,
  readOnly,
}: {
  value: ContentFormat | "";
  onChange: (value: ContentFormat) => void;
  readOnly?: boolean;
}) {
  return (
    <OptionButtons
      label="형식"
      value={value}
      options={[
        { value: "short", label: "숏폼" },
        { value: "mid", label: "미드폼" },
        { value: "long", label: "롱폼" },
      ]}
      onChange={onChange}
      readOnly={readOnly}
      getSelectedClassName={getContentFormatButtonClassName}
    />
  );
}

const TITLE_MAP: Record<FormMode, string> = {
  new: "채널 추가",
  edit: "채널 수정",
  view: "채널 보기",
};

const STATUS_OPTIONS: { value: ChannelStatus; label: string }[] = [
  { value: "active", label: "활성" },
  { value: "warning", label: "경고" },
  { value: "inactive", label: "비활성" },
  { value: "deleted", label: "삭제" },
];

const MONETIZATION_OPTIONS: { value: MonetizationType; label: string }[] = [
  { value: "organic", label: "자력 수창" },
  { value: "purchased", label: "구매" },
];

export function ChannelForm({
  form,
  mode,
  saving,
  categories,
  countries,
  templates,
  youtubeAccounts,
  adsenseAccounts,
  onChange,
  onSubmit,
  onCancel,
}: ChannelFormProps) {
  const readOnly = mode === "view";
  const fieldProps = readOnly ? { disabled: true, readOnly: true } : {};

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, saving]);

  function handleUsdChange(value: string) {
    if (readOnly) return;
    if (value && !Number.isNaN(Number(value))) {
      onChange({ priceUsd: value, priceKrw: String(usdToKrw(Number(value))) });
      notify.currency(
        `실시간 환율(${USD_TO_KRW_RATE.toLocaleString()}원)이 적용되었습니다.`
      );
    } else {
      onChange({ priceUsd: value });
    }
  }

  const categoryOptions = [
    { value: "", label: "선택" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];
  const countryOptions = [
    { value: "", label: "선택" },
    ...countries.map((c) => ({ value: c, label: c })),
  ];
  const youtubeOptions = [
    { value: "", label: "연결 안 함" },
    ...youtubeAccounts.map((a) => ({ value: a.id, label: a.label })),
  ];
  const adsenseOptions = [
    { value: "", label: "연결 안 함" },
    ...adsenseAccounts.map((a) => ({ value: a.id, label: a.label })),
  ];
  const templateOptions = [
    { value: "", label: "선택 안 함" },
    ...templates.map((t) => ({ value: t, label: t })),
  ];

  function handleHandleChange(value: string) {
    if (readOnly) return;
    onChange({ handle: formatYoutubeHandle(value) });
  }

  function handleStatusChange(status: ChannelStatus) {
    if (readOnly) return;
    onChange({
      status,
      warningDates: status === "warning" ? form.warningDates : [],
      inactiveDate: status === "inactive" ? form.inactiveDate : "",
      deletedDate: status === "deleted" ? form.deletedDate : "",
    });
  }

  function updateWarningDate(index: number, value: string) {
    const warningDates = [...form.warningDates];
    warningDates[index] = formatKoreanShortDateInput(value);
    onChange({ warningDates });
  }

  function addWarningDate() {
    onChange({ warningDates: [...form.warningDates, ""] });
  }

  function removeWarningDate(index: number) {
    onChange({ warningDates: form.warningDates.filter((_, i) => i !== index) });
  }

  const statusDateFieldProps = {
    placeholder: "25년. 06월. 19일",
    inputMode: "numeric" as const,
    ...fieldProps,
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h2 className="text-body-lg font-semibold text-text-primary">{TITLE_MAP[mode]}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!readOnly) onSubmit();
        }}
        className="space-y-6 p-5"
      >
        <div className="space-y-4">
          <SectionTitle icon="📺">기본 정보</SectionTitle>

          <div className="grid gap-4 md:grid-cols-3">
            <Input label="채널명" value={form.name} onChange={(e) => onChange({ name: e.target.value })} {...fieldProps} />
            <Input
              label="핸들명"
              value={form.handle}
              onChange={(e) => handleHandleChange(e.target.value)}
              placeholder="@channel"
              {...fieldProps}
            />
            <Select
              label="수입 발생"
              value={form.hasRevenue ? "yes" : "no"}
              onChange={(e) => onChange({ hasRevenue: e.target.value === "yes" })}
              options={[
                { value: "yes", label: "예" },
                { value: "no", label: "아니오" },
              ]}
              disabled={readOnly}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Select label="카테고리" value={form.category} onChange={(e) => onChange({ category: e.target.value })} options={categoryOptions} disabled={readOnly} />
            <Select
              label="템플릿"
              value={form.template}
              onChange={(e) => onChange({ template: e.target.value })}
              options={templateOptions}
              disabled={readOnly || templates.length === 0}
            />
            <Select label="국가" value={form.country} onChange={(e) => onChange({ country: e.target.value })} options={countryOptions} disabled={readOnly} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input label="생성일" type="date" value={form.createdDate} onChange={(e) => onChange({ createdDate: e.target.value })} {...fieldProps} />
            <Select
              label="상태"
              value={form.status}
              onChange={(e) => handleStatusChange(e.target.value as ChannelStatus)}
              options={STATUS_OPTIONS}
              disabled={readOnly}
            />
            <ContentFormatButtons
              value={form.contentFormat}
              onChange={(contentFormat) => onChange({ contentFormat })}
              readOnly={readOnly}
            />
          </div>

          {form.status === "warning" && (
            <div className="space-y-3">
              <p className="text-label-caps text-on-surface-variant">경고 날짜</p>
              {form.warningDates.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">등록된 경고 날짜가 없습니다.</p>
              ) : (
                form.warningDates.map((date, index) => (
                  <div key={`warning-date-${index}`} className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[220px] flex-1">
                      <Input
                        label={index === 0 ? "날짜" : undefined}
                        value={date}
                        onChange={(e) => updateWarningDate(index, e.target.value)}
                        {...statusDateFieldProps}
                      />
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeWarningDate(index)}
                        className="mb-0.5 rounded-lg border border-border-subtle px-3 py-2.5 text-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-red-400"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))
              )}
              {!readOnly && (
                <Button type="button" variant="ghost" onClick={addWarningDate}>
                  + 날짜 추가
                </Button>
              )}
            </div>
          )}

          {form.status === "inactive" && (
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="비활성 날짜"
                value={form.inactiveDate}
                onChange={(e) =>
                  onChange({ inactiveDate: formatKoreanShortDateInput(e.target.value) })
                }
                {...statusDateFieldProps}
              />
            </div>
          )}

          {form.status === "deleted" && (
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="삭제 날짜"
                value={form.deletedDate}
                onChange={(e) =>
                  onChange({ deletedDate: formatKoreanShortDateInput(e.target.value) })
                }
                {...statusDateFieldProps}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <SectionTitle icon="🔗">계정 연결</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="유튜브 계정"
              value={form.youtubeAccountId}
              onChange={(e) => onChange({ youtubeAccountId: e.target.value })}
              options={youtubeOptions}
              disabled={readOnly}
            />
            <Select
              label="애드센스 계정"
              value={form.adsenseAccountId}
              onChange={(e) => onChange({ adsenseAccountId: e.target.value })}
              options={adsenseOptions}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-border-subtle pt-4">
          <SectionTitle icon="💰">수익 창출</SectionTitle>

          <OptionButtons
            label="수창 구분"
            value={form.monetizationType}
            options={MONETIZATION_OPTIONS}
            onChange={(monetizationType) => onChange({ monetizationType })}
            readOnly={readOnly}
          />

          {form.monetizationType === "organic" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="수창 날짜"
                value={form.monetizationDate}
                onChange={(e) =>
                  onChange({ monetizationDate: formatKoreanShortDateInput(e.target.value) })
                }
                placeholder="25년. 06월. 19일"
                inputMode="numeric"
                {...fieldProps}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="구매처" value={form.purchaseSource} onChange={(e) => onChange({ purchaseSource: e.target.value })} {...fieldProps} />
              <Input label="판매자" value={form.seller} onChange={(e) => onChange({ seller: e.target.value })} {...fieldProps} />
              <Input label="가격 (USD)" type="number" value={form.priceUsd} onChange={(e) => handleUsdChange(e.target.value)} {...fieldProps} />
              <Input label="가격 (KRW)" type="number" value={form.priceKrw} onChange={(e) => onChange({ priceKrw: e.target.value })} {...fieldProps} />
              <Input
                label="채널 구매일"
                value={form.purchaseDate}
                onChange={(e) =>
                  onChange({ purchaseDate: formatKoreanShortDateInput(e.target.value) })
                }
                placeholder="25년. 06월. 19일"
                inputMode="numeric"
                {...fieldProps}
              />
              <Input
                label="채널 시작일"
                value={form.startDate}
                onChange={(e) =>
                  onChange({ startDate: formatKoreanShortDateInput(e.target.value) })
                }
                placeholder="25년. 06월. 19일"
                inputMode="numeric"
                {...fieldProps}
              />
              <Input label="판매자 타겟국가" value={form.purchaseCountry} onChange={(e) => onChange({ purchaseCountry: e.target.value })} {...fieldProps} />
              <Input label="카테고리" value={form.purchaseCategory} onChange={(e) => onChange({ purchaseCategory: e.target.value })} {...fieldProps} />
            </div>
          )}
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
