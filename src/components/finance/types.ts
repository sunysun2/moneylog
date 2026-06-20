import type { TransactionSource, TransactionType } from "@/models/Transaction";
import {
  isoToKoreanShortDate,
  koreanShortDateToIso,
} from "@/lib/korean-short-date-format";

const KRW_PER_MAN = 10_000;

/** 만원 입력값에 3자리마다 쉼표를 추가합니다. */
export function formatManwonInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

/** 쉼표가 포함된 만원 입력값을 숫자로 변환합니다. */
export function parseManwonInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits);
}

export interface TransactionData {
  id: string;
  type: TransactionType;
  date: string;
  source: TransactionSource;
  description: string;
  category?: string;
  amountKrw: number;
  amountUsd?: number;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export type FormMode = "new" | "edit" | "view";
export type TypeFilter = "all" | TransactionType;
export type PeriodFilter = "all" | "1y" | "3m" | "month";

export const PERIOD_FILTER_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "전체 조회" },
  { value: "1y", label: "최근 1년 조회" },
  { value: "3m", label: "최근 3개월 조회" },
  { value: "month", label: "당월 조회" },
];

const PERIOD_FILTER_GHOST_CLASS =
  "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high";

export function getPeriodFilterButtonClassName(period: PeriodFilter, selected: boolean): string {
  if (!selected) return PERIOD_FILTER_GHOST_CLASS;

  switch (period) {
    case "all":
      return "bg-surface-container-highest text-text-primary border border-outline-variant";
    case "1y":
      return "bg-secondary-container text-on-secondary-container";
    case "3m":
      return "bg-tertiary-container text-white";
    case "month":
      return "bg-primary-container text-text-primary glow-primary";
  }
}

export function periodFilterLabel(period: PeriodFilter): string {
  switch (period) {
    case "all":
      return "전체";
    case "1y":
      return "최근 1년";
    case "3m":
      return "최근 3개월";
    case "month": {
      const now = new Date();
      return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    }
  }
}

export const EXPENSE_REASON_OPTIONS = [
  "채널 구매",
  "휴대폰 구매",
  "통신 요금",
  "구독요금",
  "프리랜서",
  "세금",
  "기타",
] as const;

export interface TransactionFormState {
  date: string;
  description: string;
  category: string;
  amountKrw: string;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function emptyForm(): TransactionFormState {
  return {
    date: isoToKoreanShortDate(todayString()),
    description: "",
    category: "",
    amountKrw: "",
  };
}

export function transactionToForm(transaction: TransactionData): TransactionFormState {
  return {
    date: isoToKoreanShortDate(transaction.date.slice(0, 10)),
    description: transaction.description,
    category: transaction.category ?? "",
    amountKrw: formatManwonInput(String(transaction.amountKrw / KRW_PER_MAN)),
  };
}

export function formToPayload(type: TransactionType, form: TransactionFormState) {
  const man = parseManwonInput(form.amountKrw);

  return {
    type,
    date: koreanShortDateToIso(form.date),
    description: form.description.trim(),
    category: form.category.trim() || undefined,
    amountKrw: man * KRW_PER_MAN,
    source: "manual" as const,
  };
}

export function validateTransactionForm(
  form: TransactionFormState,
  type: TransactionType
): string | null {
  if (!form.description.trim()) {
    return type === "expense" ? "지출 사유를 선택해 주세요." : "채널명을 선택해 주세요.";
  }
  if (!parseManwonInput(form.amountKrw)) return "만원 단위 금액을 입력해 주세요.";
  if (!koreanShortDateToIso(form.date)) return "날짜를 올바르게 입력해 주세요.";
  return null;
}

export function sourceLabel(source: TransactionSource): string {
  switch (source) {
    case "youtube_purchase":
      return "유튜브 구매";
    case "adsense_purchase":
      return "애드센스 구매";
    case "channel_purchase":
      return "채널 구매";
    default:
      return "수동";
  }
}

export function formatKrw(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function formatUsd(value?: number): string {
  if (value == null) return "—";
  return `$${value.toLocaleString("en-US")}`;
}
