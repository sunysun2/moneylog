import { normalizeKoreanPhoneForSave } from "@/lib/phone-format";

export interface FreelancerData {
  id: string;
  name: string;
  phone?: string;
  kakaoId?: string;
  bank?: string;
  accountNumber?: string;
  channel?: string;
  nasId?: string;
  nasPassword?: string;
}

export type FormMode = "new" | "edit" | "view";

export interface FreelancerFormState {
  name: string;
  phone: string;
  kakaoId: string;
  bank: string;
  accountNumber: string;
  channel: string;
  nasId: string;
  nasPassword: string;
}

export const EMPTY_FORM: FreelancerFormState = {
  name: "",
  phone: "",
  kakaoId: "",
  bank: "",
  accountNumber: "",
  channel: "",
  nasId: "",
  nasPassword: "",
};

export function freelancerToForm(freelancer: FreelancerData): FreelancerFormState {
  return {
    name: freelancer.name,
    phone: freelancer.phone ?? "",
    kakaoId: freelancer.kakaoId ?? "",
    bank: freelancer.bank ?? "",
    accountNumber: freelancer.accountNumber ?? "",
    channel: freelancer.channel ?? "",
    nasId: freelancer.nasId ?? "",
    nasPassword: freelancer.nasPassword ?? "",
  };
}

export function formToPayload(form: FreelancerFormState) {
  return {
    name: form.name.trim(),
    phone: normalizeKoreanPhoneForSave(form.phone),
    kakaoId: form.kakaoId.trim() || undefined,
    bank: form.bank.trim() || undefined,
    accountNumber: form.accountNumber.trim() || undefined,
    channel: form.channel.trim() || undefined,
    nasId: form.nasId.trim() || undefined,
    nasPassword: form.nasPassword.trim() || undefined,
  };
}

export type FreelancerExpensePeriod = "all" | "today" | "1w" | "month" | "3m";

export const ALL_FREELANCERS_SELECTION = "all";
export const ALL_FREELANCERS_SELECTION_LABEL = "전체 조회";

export interface FreelancerExpenseItem {
  id: string;
  date: string;
  amountKrw: number;
  category?: string;
}

export interface FreelancerExpenseResult {
  freelancerId: string;
  freelancerName: string;
  period: FreelancerExpensePeriod;
  totalAmountKrw: number;
  items: FreelancerExpenseItem[];
}

export const FREELANCER_EXPENSE_PERIOD_OPTIONS: {
  value: FreelancerExpensePeriod;
  label: string;
}[] = [
  { value: "all", label: "전체 조회" },
  { value: "3m", label: "3달 조회" },
  { value: "month", label: "1달 조회" },
  { value: "1w", label: "1주일 조회" },
  { value: "today", label: "금일 조회" },
];

const FREELANCER_EXPENSE_PERIOD_GHOST_CLASS =
  "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high";

export function getFreelancerExpensePeriodButtonClassName(
  period: FreelancerExpensePeriod,
  selected: boolean
): string {
  if (!selected) return FREELANCER_EXPENSE_PERIOD_GHOST_CLASS;

  switch (period) {
    case "all":
      return "bg-red-500 text-white";
    case "3m":
      return "bg-purple-600 text-white";
    case "month":
      return "bg-info text-white";
    case "1w":
      return "bg-warning text-text-primary";
    case "today":
      return "bg-primary-container text-text-primary glow-primary";
  }
}

export function freelancerExpensePeriodLabel(period: FreelancerExpensePeriod): string {
  switch (period) {
    case "today":
      return "금일";
    case "1w":
      return "최근 1주일";
    case "month":
      return "최근 1달";
    case "3m":
      return "최근 3달";
    default:
      return "전체";
  }
}
