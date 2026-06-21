import type { ChannelStatus, ContentFormat } from "@/models/Channel";
import type { TransactionType } from "@/models/Transaction";

export interface DashboardSummary {
  totalChannels: number;
  revenueChannels: number;
  activeAdsense: number;
  activeYoutube: number;
  totalPhones: number;
  monthIncome: number;
  monthExpense: number;
  monthNetProfit: number;
  threeMonthNetProfit: number;
  allNetProfit: number;
}

export interface DashboardWarningItem {
  id: string;
  source: "youtube" | "adsense" | "channel";
  sourceLabel: string;
  name: string;
  status: "warning" | "deleted" | "inactive";
}

export interface DashboardChannelItem {
  id: string;
  name: string;
  handle: string;
  status: ChannelStatus;
  contentFormat?: ContentFormat;
  hasRevenue: boolean;
  youtubeAccountLabel?: string;
  adsenseAccountLabel?: string;
}

export interface DashboardChannelRanking {
  name: string;
  income: number;
}

export interface DashboardChannelRankings {
  month: DashboardChannelRanking[];
  threeMonth: DashboardChannelRanking[];
}

export interface DashboardRecentTransaction {
  id: string;
  type: TransactionType;
  date: string;
  description: string;
  category?: string;
  amountKrw: number;
}

export interface DashboardNetProfitPoint {
  month: string;
  label: string;
  netProfit: number;
}

export interface DashboardData {
  referenceDate: string;
  calendarMonthLabel: string;
  summary: DashboardSummary;
  warnings: DashboardWarningItem[];
  channels: DashboardChannelItem[];
  channelRanking: DashboardChannelRankings;
  recentTransactions: DashboardRecentTransaction[];
  netProfitTrend: DashboardNetProfitPoint[];
}

export type DashboardNetProfitPeriod = "all" | "3m" | "month";

export const DASHBOARD_NET_PROFIT_OPTIONS: {
  value: DashboardNetProfitPeriod;
  label: string;
}[] = [
  { value: "all", label: "전체 순이익" },
  { value: "3m", label: "3개월 순이익" },
  { value: "month", label: "당월 순이익" },
];

export function getDashboardNetProfitButtonClassName(
  period: DashboardNetProfitPeriod,
  selected: boolean
): string {
  if (!selected) {
    return "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high";
  }

  switch (period) {
    case "all":
      return "bg-red-500 text-white";
    case "3m":
      return "bg-blue-600 text-white";
    case "month":
      return "bg-primary-container text-text-primary glow-primary";
  }
}

export function dashboardNetProfitLabel(period: DashboardNetProfitPeriod): string {
  switch (period) {
    case "all":
      return "전체 순이익";
    case "3m":
      return "3개월 순이익";
    case "month":
      return "당월 순이익";
  }
}

export function getDashboardNetProfitAmount(
  summary: DashboardSummary,
  period: DashboardNetProfitPeriod
): number {
  switch (period) {
    case "all":
      return summary.allNetProfit;
    case "3m":
      return summary.threeMonthNetProfit;
    case "month":
      return summary.monthNetProfit;
  }
}
