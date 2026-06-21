import type {
  AccountOrigin,
  AccountStatus,
  AdsenseLinkStatus,
} from "@/models/YoutubeAccount";
import {
  isoToKoreanShortDate,
  koreanShortDateToIso,
} from "@/lib/korean-short-date-format";
import { normalizeKoreanPhoneForSave } from "@/lib/phone-format";

export interface OtpEntry {
  label: string;
  secret: string;
  notes: string;
}

export interface YoutubeAccountData {
  id: string;
  accountId: string;
  password: string;
  adsenseAccount?: string;
  phone?: string;
  origin: AccountOrigin;
  isInUse: boolean;
  channelName?: string;
  adsenseStatus: AdsenseLinkStatus;
  otpInUse: boolean;
  otps: OtpEntry[];
  createdDate?: string;
  purchaseSource?: string;
  seller?: string;
  priceUsd?: number;
  priceKrw?: number;
  purchaseDate?: string;
  accountCreatedDate?: string;
  status: AccountStatus;
  sortOrder: number;
}

export type FormMode = "new" | "edit" | "view";

export interface YoutubeAccountFormState {
  accountId: string;
  password: string;
  linkedAdsenseAccountId: string;
  adsenseAccount: string;
  phone: string;
  origin: AccountOrigin;
  isInUse: boolean;
  channelName: string;
  adsenseStatus: AdsenseLinkStatus;
  otpInUse: boolean;
  otpKey: string;
  otpBackup: string;
  createdDate: string;
  purchaseSource: string;
  seller: string;
  priceUsd: string;
  priceKrw: string;
  purchaseDate: string;
  accountCreatedDate: string;
  status: AccountStatus;
}

export const EMPTY_FORM: YoutubeAccountFormState = {
  accountId: "",
  password: "",
  linkedAdsenseAccountId: "",
  adsenseAccount: "",
  phone: "",
  origin: "created",
  isInUse: true,
  channelName: "",
  adsenseStatus: "unlinked",
  otpInUse: true,
  otpKey: "",
  otpBackup: "",
  createdDate: "",
  purchaseSource: "",
  seller: "",
  priceUsd: "",
  priceKrw: "",
  purchaseDate: "",
  accountCreatedDate: "",
  status: "active",
};

export function accountToForm(
  account: YoutubeAccountData,
  linkedAdsenseAccountId = ""
): YoutubeAccountFormState {
  const primaryOtp = account.otps.find((o) => o.label !== "백업");
  const backupOtp = account.otps.find((o) => o.label === "백업");

  return {
    accountId: account.accountId,
    password: account.password,
    linkedAdsenseAccountId,
    adsenseAccount: account.adsenseAccount ?? "",
    phone: account.phone ?? "",
    origin: account.origin,
    isInUse: account.isInUse,
    channelName: account.channelName ?? "",
    adsenseStatus: account.adsenseStatus,
    otpInUse: account.otpInUse ?? true,
    otpKey: primaryOtp?.secret ?? "",
    otpBackup: backupOtp?.notes ?? "",
    createdDate: account.createdDate
      ? isoToKoreanShortDate(account.createdDate.slice(0, 10))
      : "",
    purchaseSource: account.purchaseSource ?? "",
    seller: account.seller ?? "",
    priceUsd: account.priceUsd?.toString() ?? "",
    priceKrw: account.priceKrw?.toString() ?? "",
    purchaseDate: account.purchaseDate?.slice(0, 10) ?? "",
    accountCreatedDate: account.accountCreatedDate?.slice(0, 10) ?? "",
    status: account.status,
  };
}

export function formToPayload(form: YoutubeAccountFormState) {
  const otps: OtpEntry[] = [];

  if (form.otpInUse && form.otpKey) {
    otps.push({ label: "앱", secret: form.otpKey, notes: "" });
  }
  if (form.otpInUse && form.otpBackup) {
    otps.push({ label: "백업", secret: "", notes: form.otpBackup });
  }

  return {
    accountId: form.accountId,
    password: form.password,
    adsenseAccount: form.adsenseAccount || undefined,
    phone: normalizeKoreanPhoneForSave(form.phone),
    origin: form.origin,
    isInUse: form.isInUse,
    apiKey: form.channelName || undefined,
    adsenseStatus: form.adsenseStatus,
    otpInUse: form.otpInUse,
    otps,
    createdDate: koreanShortDateToIso(form.createdDate),
    purchaseSource: form.purchaseSource || undefined,
    seller: form.seller || undefined,
    priceUsd: form.priceUsd ? Number(form.priceUsd) : undefined,
    priceKrw: form.priceKrw ? Number(form.priceKrw) : undefined,
    purchaseDate: form.purchaseDate || undefined,
    accountCreatedDate: form.accountCreatedDate || undefined,
    status: form.status,
  };
}

export function getOtpBadges(otps: OtpEntry[], otpInUse: boolean): string[] {
  if (!otpInUse) return [];
  const badges: string[] = [];
  for (const otp of otps) {
    if (otp.label === "백업" && (otp.notes || otp.secret)) {
      badges.push("백업");
    } else if ((otp.label === "문자" || otp.label === "SMS") && otp.secret) {
      badges.push("문자");
    } else if (otp.secret) {
      badges.push("앱");
    }
  }
  return [...new Set(badges)];
}

export function adsenseLinkToYoutubeFormPatch(link: {
  adsenseAccountId: string;
  adsenseAccountLabel: string;
  phone?: string;
  otpInUse: boolean;
  otpKey?: string;
  otpBackup?: string;
  adsenseStatus: AdsenseLinkStatus;
}): Partial<YoutubeAccountFormState> {
  return {
    linkedAdsenseAccountId: link.adsenseAccountId,
    adsenseAccount: link.adsenseAccountLabel,
    phone: link.phone ?? "",
    otpInUse: link.otpInUse,
    otpKey: link.otpKey ?? "",
    otpBackup: link.otpBackup ?? "",
    adsenseStatus: link.adsenseStatus,
  };
}

export function clearAdsenseLinkPatch(): Partial<YoutubeAccountFormState> {
  return {
    linkedAdsenseAccountId: "",
    adsenseAccount: "",
    phone: "",
    otpInUse: true,
    otpKey: "",
    otpBackup: "",
    adsenseStatus: "unlinked",
  };
}
