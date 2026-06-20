import type { ChannelStatus, ContentFormat, MonetizationType } from "@/models/Channel";
import { formatYoutubeHandle } from "@/lib/handle-format";
import {
  isoToKoreanShortDate,
  koreanShortDateToIso,
} from "@/lib/korean-short-date-format";

export interface ChannelData {
  id: string;
  name: string;
  handle: string;
  template?: string;
  category: string;
  country: string;
  contentFormat?: ContentFormat;
  createdDate?: string;
  hasRevenue: boolean;
  status: ChannelStatus;
  warningDates?: string[];
  inactiveDate?: string;
  deletedDate?: string;
  youtubeAccountId?: string;
  youtubeAccountLabel?: string;
  adsenseAccountId?: string;
  adsenseAccountLabel?: string;
  monetizationType: MonetizationType;
  monetizationDate?: string;
  purchaseSource?: string;
  seller?: string;
  priceUsd?: number;
  priceKrw?: number;
  purchaseDate?: string;
  startDate?: string;
  purchaseCountry?: string;
  purchaseCategory?: string;
  sortOrder: number;
}

export type FormMode = "new" | "edit" | "view";

export interface ChannelFormState {
  template: string;
  name: string;
  handle: string;
  category: string;
  country: string;
  contentFormat: ContentFormat | "";
  createdDate: string;
  hasRevenue: boolean;
  status: ChannelStatus;
  warningDates: string[];
  inactiveDate: string;
  deletedDate: string;
  youtubeAccountId: string;
  adsenseAccountId: string;
  monetizationType: MonetizationType;
  monetizationDate: string;
  purchaseSource: string;
  seller: string;
  priceUsd: string;
  priceKrw: string;
  purchaseDate: string;
  startDate: string;
  purchaseCountry: string;
  purchaseCategory: string;
}

export const EMPTY_FORM: ChannelFormState = {
  template: "",
  name: "",
  handle: "",
  category: "",
  country: "",
  contentFormat: "",
  createdDate: "",
  hasRevenue: false,
  status: "active",
  warningDates: [],
  inactiveDate: "",
  deletedDate: "",
  youtubeAccountId: "",
  adsenseAccountId: "",
  monetizationType: "organic",
  monetizationDate: "",
  purchaseSource: "",
  seller: "",
  priceUsd: "",
  priceKrw: "",
  purchaseDate: "",
  startDate: "",
  purchaseCountry: "",
  purchaseCategory: "",
};

export function channelToForm(channel: ChannelData): ChannelFormState {
  return {
    template: channel.template ?? "",
    name: channel.name,
    handle: formatYoutubeHandle(channel.handle),
    category: channel.category ?? "",
    country: channel.country ?? "",
    contentFormat: channel.contentFormat ?? "",
    createdDate: channel.createdDate?.slice(0, 10) ?? "",
    hasRevenue: channel.hasRevenue,
    status: channel.status,
    warningDates: (channel.warningDates ?? []).map((date) =>
      isoToKoreanShortDate(date.slice(0, 10))
    ),
    inactiveDate: channel.inactiveDate
      ? isoToKoreanShortDate(channel.inactiveDate.slice(0, 10))
      : "",
    deletedDate: channel.deletedDate
      ? isoToKoreanShortDate(channel.deletedDate.slice(0, 10))
      : "",
    youtubeAccountId: channel.youtubeAccountId ?? "",
    adsenseAccountId: channel.adsenseAccountId ?? "",
    monetizationType: channel.monetizationType,
    monetizationDate: channel.monetizationDate
      ? isoToKoreanShortDate(channel.monetizationDate.slice(0, 10))
      : "",
    purchaseSource: channel.purchaseSource ?? "",
    seller: channel.seller ?? "",
    priceUsd: channel.priceUsd?.toString() ?? "",
    priceKrw: channel.priceKrw?.toString() ?? "",
    purchaseDate: channel.purchaseDate
      ? isoToKoreanShortDate(channel.purchaseDate.slice(0, 10))
      : "",
    startDate: channel.startDate
      ? isoToKoreanShortDate(channel.startDate.slice(0, 10))
      : "",
    purchaseCountry: channel.purchaseCountry ?? "",
    purchaseCategory: channel.purchaseCategory ?? "",
  };
}

export function formToPayload(form: ChannelFormState) {
  const base = {
    name: form.name,
    handle: formatYoutubeHandle(form.handle),
    template: form.template || null,
    category: form.category || undefined,
    country: form.country || undefined,
    contentFormat:
      form.contentFormat === "short" ||
      form.contentFormat === "mid" ||
      form.contentFormat === "long"
        ? form.contentFormat
        : null,
    createdDate: form.createdDate || null,
    hasRevenue: form.hasRevenue,
    status: form.status,
    warningDates:
      form.status === "warning"
        ? form.warningDates
            .map((date) => koreanShortDateToIso(date))
            .filter((date): date is string => Boolean(date))
        : [],
    inactiveDate:
      form.status === "inactive" ? koreanShortDateToIso(form.inactiveDate) ?? null : null,
    deletedDate:
      form.status === "deleted" ? koreanShortDateToIso(form.deletedDate) ?? null : null,
    youtubeAccount: form.youtubeAccountId || null,
    adsenseAccount: form.adsenseAccountId || null,
    monetizationType: form.monetizationType,
  };

  if (form.monetizationType === "organic") {
    return {
      ...base,
      monetizationDate: koreanShortDateToIso(form.monetizationDate) ?? null,
      purchaseSource: null,
      seller: null,
      priceUsd: null,
      priceKrw: null,
      purchaseDate: null,
      startDate: null,
      purchaseCountry: null,
      purchaseCategory: null,
    };
  }

  return {
    ...base,
    monetizationDate: null,
    purchaseSource: form.purchaseSource || null,
    seller: form.seller || null,
    priceUsd: form.priceUsd ? Number(form.priceUsd) : null,
    priceKrw: form.priceKrw ? Number(form.priceKrw) : null,
    purchaseDate: koreanShortDateToIso(form.purchaseDate) ?? null,
    startDate: koreanShortDateToIso(form.startDate) ?? null,
    purchaseCountry: form.purchaseCountry || null,
    purchaseCategory: form.purchaseCategory || null,
  };
}

export function statusLabel(status: ChannelStatus): string {
  switch (status) {
    case "active":
      return "활성";
    case "warning":
      return "경고";
    case "deleted":
      return "삭제";
    default:
      return "비활성";
  }
}
