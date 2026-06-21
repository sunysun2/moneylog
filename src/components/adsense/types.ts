import type { AccountStatus } from "@/models/AdsenseAccount";
import type { OtpEntry } from "@/components/youtube/types";
import { getOtpBadges } from "@/components/youtube/types";
import {
  isoToKoreanShortDate,
  koreanShortDateToIso,
} from "@/lib/korean-short-date-format";
import { normalizeKoreanPhoneForSave } from "@/lib/phone-format";

export type { OtpEntry };
export { getOtpBadges };

export interface LinkedYoutubeEntry {
  youtubeAccountId: string;
  youtubeAccount: string;
  channelName: string;
}

export const MAX_LINKED_YOUTUBE_ACCOUNTS = 5;

export interface AdsenseAccountData {
  id: string;
  accountId: string;
  password: string;
  holderName?: string;
  youtubeAccount?: string;
  channelName?: string;
  linkedYoutubeAccounts?: LinkedYoutubeEntry[];
  linkedYoutubeCount?: number;
  bank?: string;
  accountNumber?: string;
  phone?: string;
  address?: string;
  appliedDate?: string;
  arrivedDate?: string;
  status: AccountStatus;
  otpInUse: boolean;
  otps: OtpEntry[];
  linkedYoutubeAccountId?: string;
  sortOrder: number;
}

export type FormMode = "new" | "edit" | "view";

export interface AdsenseAccountFormState {
  accountId: string;
  password: string;
  holderName: string;
  youtubeAccount: string;
  channelName: string;
  bank: string;
  accountNumber: string;
  phone: string;
  address: string;
  appliedDate: string;
  arrivedDate: string;
  status: AccountStatus;
  otpInUse: boolean;
  otpApp: string;
  otpSms: string;
  otpBackup: string;
  linkedYoutubeAccountId: string;
  linkedYoutubeAccounts: LinkedYoutubeEntry[];
}

export const EMPTY_FORM: AdsenseAccountFormState = {
  accountId: "",
  password: "",
  holderName: "",
  youtubeAccount: "",
  channelName: "",
  bank: "",
  accountNumber: "",
  phone: "",
  address: "",
  appliedDate: "",
  arrivedDate: "",
  status: "pending",
  otpInUse: true,
  otpApp: "",
  otpSms: "",
  otpBackup: "",
  linkedYoutubeAccountId: "",
  linkedYoutubeAccounts: [],
};

function findOtpSecret(otps: OtpEntry[], labels: string[]) {
  const otp = otps.find((o) => labels.includes(o.label));
  return otp?.secret ?? "";
}

function findOtpBackup(otps: OtpEntry[]) {
  const otp = otps.find((o) => o.label === "백업");
  return otp?.notes || otp?.secret || "";
}

export function accountToForm(account: AdsenseAccountData): AdsenseAccountFormState {
  const linkedYoutubeAccounts = account.linkedYoutubeAccounts ?? [];
  const first = linkedYoutubeAccounts[0];

  return {
    accountId: account.accountId,
    password: account.password,
    holderName: account.holderName ?? "",
    youtubeAccount: first?.youtubeAccount ?? account.youtubeAccount ?? "",
    channelName: first?.channelName ?? account.channelName ?? "",
    bank: account.bank ?? "",
    accountNumber: account.accountNumber ?? "",
    phone: account.phone ?? "",
    address: account.address ?? "",
    appliedDate: account.appliedDate
      ? isoToKoreanShortDate(account.appliedDate.slice(0, 10))
      : "",
    arrivedDate: account.arrivedDate
      ? isoToKoreanShortDate(account.arrivedDate.slice(0, 10))
      : "",
    status: account.status,
    otpInUse: account.otpInUse ?? true,
    otpApp: findOtpSecret(account.otps, ["앱"]),
    otpSms: findOtpSecret(account.otps, ["문자", "SMS"]),
    otpBackup: findOtpBackup(account.otps),
    linkedYoutubeAccountId:
      first?.youtubeAccountId ?? account.linkedYoutubeAccountId ?? "",
    linkedYoutubeAccounts,
  };
}

export function formToPayload(form: AdsenseAccountFormState) {
  const otps: OtpEntry[] = [];

  if (form.otpInUse && form.otpApp) {
    otps.push({ label: "앱", secret: form.otpApp, notes: "" });
  }
  if (form.otpInUse && form.otpSms) {
    otps.push({ label: "문자", secret: form.otpSms, notes: "" });
  }
  if (form.otpInUse && form.otpBackup) {
    otps.push({ label: "백업", secret: "", notes: form.otpBackup });
  }

  const first = form.linkedYoutubeAccounts[0];

  return {
    accountId: form.accountId,
    password: form.password,
    holderName: form.holderName || undefined,
    youtubeAccount: first?.youtubeAccount || form.youtubeAccount || undefined,
    channelName: first?.channelName || form.channelName || undefined,
    linkedYoutubeAccount:
      first?.youtubeAccountId || form.linkedYoutubeAccountId || undefined,
    bank: form.bank || undefined,
    accountNumber: form.accountNumber || undefined,
    phone: normalizeKoreanPhoneForSave(form.phone),
    address: form.address || undefined,
    appliedDate: koreanShortDateToIso(form.appliedDate),
    arrivedDate: koreanShortDateToIso(form.arrivedDate),
    status: form.status,
    otpInUse: form.otpInUse,
    otps,
  };
}

export function youtubeLinksToFormPatch(links: {
  youtubeAccountId: string;
  youtubeAccountLabel: string;
  channelName?: string;
  password?: string;
  phone?: string;
  otpInUse?: boolean;
  otps?: OtpEntry[];
}[]): Partial<AdsenseAccountFormState> {
  const linkedYoutubeAccounts: LinkedYoutubeEntry[] = links.map((link) => ({
    youtubeAccountId: link.youtubeAccountId,
    youtubeAccount: link.youtubeAccountLabel,
    channelName: link.channelName ?? "",
  }));

  const first = links[0];
  if (!first) {
    return {
      linkedYoutubeAccounts: [],
      linkedYoutubeAccountId: "",
      youtubeAccount: "",
      channelName: "",
    };
  }

  return {
    linkedYoutubeAccounts,
    linkedYoutubeAccountId: first.youtubeAccountId,
    youtubeAccount: first.youtubeAccountLabel,
    channelName: first.channelName ?? "",
    password: first.password ?? "",
    phone: first.phone ?? "",
    otpInUse: first.otpInUse ?? true,
    otpApp: findOtpSecret(first.otps ?? [], ["앱"]),
    otpSms: findOtpSecret(first.otps ?? [], ["문자", "SMS"]),
    otpBackup: findOtpBackup(first.otps ?? []),
  };
}

export function youtubeLinkToFormPatch(link: {
  password: string;
  phone?: string;
  channelName?: string;
  otpInUse: boolean;
  otps: OtpEntry[];
  youtubeAccountId: string;
  youtubeAccountLabel?: string;
}): Partial<AdsenseAccountFormState> {
  return youtubeLinksToFormPatch([
    {
      ...link,
      youtubeAccountLabel: link.youtubeAccountLabel ?? "",
    },
  ]);
}
