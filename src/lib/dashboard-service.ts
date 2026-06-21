import { connectDB } from "@/lib/db";
import {
  formatCalendarMonthLabel,
  formatMonthKey,
  getCalendarMonthRange,
  getCalendarThreeMonthRange,
  getReferenceDateIso,
  parseReferenceDate,
} from "@/lib/calendar-month";
import {
  mergeOwnerFilter,
  ownerFilter,
  toOwnerObjectId,
  type OwnerContext,
} from "@/lib/owner-query";
import { getMonthlyTrends, getTransactionStats } from "@/lib/transaction-service";
import { Channel } from "@/models/Channel";
import { AdsenseAccount } from "@/models/AdsenseAccount";
import { YoutubeAccount } from "@/models/YoutubeAccount";
import { PhoneDevice } from "@/models/PhoneDevice";
import { Transaction } from "@/models/Transaction";
import type { DashboardChannelRanking, DashboardData } from "@/components/dashboard/types";

type PopulatedAccount = { accountId?: string } | null;
type IncomeDoc = { description: string; amountKrw: number };

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${year.slice(-2)}.${month}`;
}

function buildChannelRanking(docs: IncomeDoc[]): DashboardChannelRanking[] {
  const incomeByChannel = new Map<string, number>();

  for (const doc of docs) {
    const key = doc.description.trim();
    if (!key) continue;
    incomeByChannel.set(key, (incomeByChannel.get(key) ?? 0) + doc.amountKrw);
  }

  return [...incomeByChannel.entries()]
    .map(([name, income]) => ({ name, income }))
    .sort((a, b) => b.income - a.income)
    .slice(0, 5);
}

export async function getDashboardData(
  ctx: OwnerContext,
  referenceDateInput?: string
): Promise<DashboardData> {
  await connectDB();

  const referenceDate = parseReferenceDate(referenceDateInput) ?? new Date();
  const referenceDateIso = getReferenceDateIso(referenceDate);
  const monthKey = formatMonthKey(referenceDate);
  const monthRange = getCalendarMonthRange(referenceDate);
  const threeMonthRange = getCalendarThreeMonthRange(referenceDate);
  const owner = ownerFilter(ctx.ownerId, ctx.isAdmin);

  const [
    totalChannels,
    revenueChannels,
    activeAdsense,
    activeYoutube,
    totalPhones,
    monthStats,
    allStats,
    threeMonthStats,
    monthlyTrends,
    recentDocs,
    monthIncomeDocs,
    threeMonthIncomeDocs,
    youtubeWarnings,
    adsenseWarnings,
    channelWarnings,
    channelDocs,
  ] = await Promise.all([
    Channel.countDocuments(owner),
    Channel.countDocuments({ ...owner, hasRevenue: true }),
    AdsenseAccount.countDocuments({ ...owner, status: "active" }),
    YoutubeAccount.countDocuments({ ...owner, status: "active" }),
    PhoneDevice.countDocuments(owner),
    getTransactionStats(ctx, { month: monthKey }),
    getTransactionStats(ctx, { period: "all" }),
    getTransactionStats(ctx, { period: "3m", referenceDate: referenceDateIso }),
    getMonthlyTrends(ctx, "1y"),
    Transaction.find(owner).sort({ date: -1, createdAt: -1 }).limit(8),
    Transaction.find(
      mergeOwnerFilter(
        { type: "income", date: { $gte: monthRange.start, $lt: monthRange.end } },
        ctx.ownerId,
        ctx.isAdmin
      )
    ).select("description amountKrw"),
    Transaction.find(
      mergeOwnerFilter(
        {
          type: "income",
          date: { $gte: threeMonthRange.start, $lt: threeMonthRange.end },
        },
        ctx.ownerId,
        ctx.isAdmin
      )
    ).select("description amountKrw"),
    YoutubeAccount.find(
      mergeOwnerFilter(
        { status: { $in: ["warning", "deleted", "inactive"] } },
        ctx.ownerId,
        ctx.isAdmin
      )
    )
      .select("accountId status")
      .sort({ updatedAt: -1 }),
    AdsenseAccount.find(
      mergeOwnerFilter(
        { status: { $in: ["warning", "deleted", "inactive"] } },
        ctx.ownerId,
        ctx.isAdmin
      )
    )
      .select("accountId status")
      .sort({ updatedAt: -1 }),
    Channel.find(
      mergeOwnerFilter(
        { status: { $in: ["warning", "deleted", "inactive"] } },
        ctx.ownerId,
        ctx.isAdmin
      )
    )
      .select("name handle status")
      .sort({ updatedAt: -1 }),
    Channel.find(owner)
      .sort({ sortOrder: 1, createdAt: 1 })
      .populate("youtubeAccount", "accountId")
      .populate("adsenseAccount", "accountId"),
  ]);

  const channelRanking = {
    month: buildChannelRanking(monthIncomeDocs),
    threeMonth: buildChannelRanking(threeMonthIncomeDocs),
  };

  const warnings: DashboardData["warnings"] = [
    ...youtubeWarnings.map((doc) => ({
      id: doc._id.toString(),
      source: "youtube" as const,
      sourceLabel: "유튜브",
      name: doc.accountId,
      status: doc.status as "warning" | "deleted" | "inactive",
    })),
    ...adsenseWarnings.map((doc) => ({
      id: doc._id.toString(),
      source: "adsense" as const,
      sourceLabel: "애드센스",
      name: doc.accountId,
      status: doc.status as "warning" | "deleted" | "inactive",
    })),
    ...channelWarnings.map((doc) => ({
      id: doc._id.toString(),
      source: "channel" as const,
      sourceLabel: "채널",
      name: doc.name,
      status: doc.status as "warning" | "deleted" | "inactive",
    })),
  ];

  const channels: DashboardData["channels"] = channelDocs.map((doc) => {
    const youtube = doc.populated("youtubeAccount") as PopulatedAccount;
    const adsense = doc.populated("adsenseAccount") as PopulatedAccount;

    return {
      id: doc._id.toString(),
      name: doc.name,
      handle: doc.handle,
      status: doc.status,
      contentFormat: doc.contentFormat ?? undefined,
      hasRevenue: doc.hasRevenue,
      youtubeAccountLabel: youtube?.accountId,
      adsenseAccountLabel: adsense?.accountId,
    };
  });

  const recentTransactions = recentDocs.map((doc) => ({
    id: doc._id.toString(),
    type: doc.type,
    date: doc.date.toISOString(),
    description: doc.description,
    category: doc.category,
    amountKrw: doc.amountKrw,
  }));

  const netProfitTrend = monthlyTrends.map((point) => ({
    month: point.month,
    label: formatMonthLabel(point.month),
    netProfit: point.income - point.expense,
  }));

  return {
    referenceDate: referenceDateIso,
    calendarMonthLabel: formatCalendarMonthLabel(referenceDate),
    summary: {
      totalChannels,
      revenueChannels,
      activeAdsense,
      activeYoutube,
      totalPhones,
      monthIncome: monthStats.totalIncome,
      monthExpense: monthStats.totalExpense,
      monthNetProfit: monthStats.netProfit,
      threeMonthNetProfit: threeMonthStats.netProfit,
      allNetProfit: allStats.netProfit,
    },
    warnings,
    channels,
    channelRanking,
    recentTransactions,
    netProfitTrend,
  };
}
