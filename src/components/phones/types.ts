import {
  isoToKoreanShortDate,
  koreanShortDateToIso,
} from "@/lib/korean-short-date-format";
import { normalizeKoreanPhoneForSave } from "@/lib/phone-format";

export const MOBILE_CARRIER_OPTIONS = [
  { value: "SKT", label: "SKT" },
  { value: "KT", label: "KT" },
  { value: "LG U+", label: "LG U+" },
  { value: "알뜰폰 SK", label: "알뜰폰 SK" },
  { value: "알뜰폰 KT", label: "알뜰폰 KT" },
  { value: "알뜰폰 LG U+", label: "알뜰폰 LG U+" },
] as const;

export const PAYMENT_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const day = String(i + 1);
  return { value: day, label: `${day}일` };
});

export interface PhoneDeviceData {
  id: string;
  devicePhone: string;
  phoneModel?: string;
  mobileCarrier?: string;
  mvnoProvider?: string;
  mobilePlan?: string;
  ratePlan?: string;
  purchaseSource?: string;
  priceKrw?: number;
  purchaseDate?: string;
  bank?: string;
  accountNumber?: string;
  paymentDay?: number;
  sortOrder: number;
}

export type FormMode = "new" | "edit" | "view";

export interface PhoneDeviceFormState {
  devicePhone: string;
  phoneModel: string;
  mobileCarrier: string;
  mvnoProvider: string;
  mobilePlan: string;
  ratePlan: string;
  purchaseSource: string;
  priceKrw: string;
  purchaseDate: string;
  bank: string;
  accountNumber: string;
  paymentDay: string;
}

export const EMPTY_FORM: PhoneDeviceFormState = {
  devicePhone: "",
  phoneModel: "",
  mobileCarrier: "",
  mvnoProvider: "",
  mobilePlan: "",
  ratePlan: "",
  purchaseSource: "",
  priceKrw: "",
  purchaseDate: "",
  bank: "",
  accountNumber: "",
  paymentDay: "",
};

export function deviceToForm(device: PhoneDeviceData): PhoneDeviceFormState {
  return {
    devicePhone: device.devicePhone,
    phoneModel: device.phoneModel ?? "",
    mobileCarrier: device.mobileCarrier ?? "",
    mvnoProvider: device.mvnoProvider ?? "",
    mobilePlan: device.mobilePlan ?? "",
    ratePlan: device.ratePlan ?? "",
    purchaseSource: device.purchaseSource ?? "",
    priceKrw: device.priceKrw?.toString() ?? "",
    purchaseDate: device.purchaseDate
      ? isoToKoreanShortDate(device.purchaseDate.slice(0, 10))
      : "",
    bank: device.bank ?? "",
    accountNumber: device.accountNumber ?? "",
    paymentDay: device.paymentDay ? String(device.paymentDay) : "",
  };
}

export function formToPayload(form: PhoneDeviceFormState) {
  return {
    devicePhone: normalizeKoreanPhoneForSave(form.devicePhone) ?? "",
    phoneModel: form.phoneModel.trim() || undefined,
    mobileCarrier: form.mobileCarrier || undefined,
    mvnoProvider: form.mvnoProvider.trim() || undefined,
    mobilePlan: form.mobilePlan.trim() || undefined,
    ratePlan: form.ratePlan.trim() || undefined,
    purchaseSource: form.purchaseSource.trim() || undefined,
    priceKrw: form.priceKrw ? Number(form.priceKrw) : undefined,
    purchaseDate: koreanShortDateToIso(form.purchaseDate),
    bank: form.bank.trim() || undefined,
    accountNumber: form.accountNumber.trim() || undefined,
    paymentDay: form.paymentDay ? Number(form.paymentDay) : undefined,
  };
}
