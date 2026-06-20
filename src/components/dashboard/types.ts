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
  summary: DashboardSummary;
  warnings: DashboardWarningItem[];
  channels: DashboardChannelItem[];
  channelRanking: DashboardChannelRankings;
  recentTransactions: DashboardRecentTransaction[];
  netProfitTrend: DashboardNetProfitPoint[];
}
