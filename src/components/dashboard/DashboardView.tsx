"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { notify } from "@/lib/notify";
import { Button, StatusPill } from "@/components/ui";
import { ContentFormatBadge } from "@/components/channels/ContentFormatBadge";
import { formatKrw, formatManwon } from "@/components/finance/types";
import { statusLabel } from "@/components/channels/types";
import { DashboardNetProfitChart } from "./DashboardNetProfitChart";
import { exportDashboardScreenshot } from "@/lib/export-dashboard-screenshot";
import { getReferenceDateIso } from "@/lib/calendar-month";
import type { DashboardChannelRanking, DashboardData, DashboardNetProfitPeriod } from "./types";
import {
  DASHBOARD_NET_PROFIT_OPTIONS,
  dashboardNetProfitLabel,
  getDashboardNetProfitAmount,
  getDashboardNetProfitButtonClassName,
} from "./types";

const EMPTY_DATA: DashboardData = {
  referenceDate: getReferenceDateIso(),
  calendarMonthLabel: "",
  summary: {
    totalChannels: 0,
    revenueChannels: 0,
    activeAdsense: 0,
    activeYoutube: 0,
    totalPhones: 0,
    monthIncome: 0,
    monthExpense: 0,
    monthNetProfit: 0,
    threeMonthNetProfit: 0,
    allNetProfit: 0,
  },
  warnings: [],
  channels: [],
  channelRanking: { month: [], threeMonth: [] },
  recentTransactions: [],
  netProfitTrend: [],
};

type RankingPeriod = "month" | "3m";

function warningStatusLabel(status: DashboardData["warnings"][number]["status"]) {
  switch (status) {
    case "warning":
      return "경고";
    case "deleted":
      return "삭제";
    default:
      return "비활성";
  }
}

function warningHref(source: DashboardData["warnings"][number]["source"]) {
  switch (source) {
    case "youtube":
      return "/youtube";
    case "adsense":
      return "/adsense";
    default:
      return "/channels";
  }
}

function formatShortDate(value: string) {
  return value.slice(0, 10);
}

function SummaryCardItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border-subtle bg-bg-surface p-5 text-center">
      <p className="summary-card-label whitespace-nowrap text-on-surface-variant text-[15.6px] leading-[21px] font-semibold uppercase tracking-[0.05em]">
        {label}
      </p>
      <p
        className={cn(
          "summary-card-value mt-2 whitespace-nowrap text-[31.2px] leading-[38px] font-bold tabular-nums",
          tone
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ChannelRankingList({ items }: { items: DashboardChannelRanking[] }) {
  if (items.length === 0) {
    return <p className="mt-4 text-body-sm text-on-surface-variant">집계할 수입 데이터가 없습니다.</p>;
  }

  return (
    <ol className="mt-4 space-y-3">
      {items.map((item, index) => (
        <li
          key={item.name}
          className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-3 py-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container/15 text-body-sm font-bold text-primary-container">
              {index + 1}
            </span>
            <span className="text-body-sm font-medium text-text-primary">{item.name}</span>
          </div>
          <span className="text-body-sm font-semibold text-primary-container">
            {formatManwon(item.income)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function DashboardView() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [referenceDate] = useState(() => getReferenceDateIso());
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>("month");
  const [netProfitPeriod, setNetProfitPeriod] = useState<DashboardNetProfitPeriod>("month");

  const activeNetProfit = getDashboardNetProfitAmount(data.summary, netProfitPeriod);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?referenceDate=${referenceDate}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      notify.error("통합 리포트를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [referenceDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleExportScreenshot() {
    if (!reportRef.current || loading) return;

    setExporting(true);

    try {
      const dateLabel = new Date().toISOString().slice(0, 10);
      await exportDashboardScreenshot(
        reportRef.current,
        `moneylog-report-${dateLabel}.png`
      );
      notify.success("스크린샷을 저장했습니다.");
    } catch (error) {
      console.error("Screenshot export failed:", error);
      notify.error("스크린샷 내보내기에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  }

  const summaryCards = [
    { label: "총 채널", value: String(data.summary.totalChannels), tone: "text-text-primary" },
    {
      label: "수창 채널",
      value: String(data.summary.revenueChannels),
      tone: "text-primary-container",
    },
    { label: "활성 애드센스", value: String(data.summary.activeAdsense), tone: "text-secondary-container" },
    { label: "당월 수입", value: formatManwon(data.summary.monthIncome), tone: "text-primary-container" },
    { label: "당월 지출", value: formatManwon(data.summary.monthExpense), tone: "text-warning" },
  ];

  const calendarMonthLabel = data.calendarMonthLabel || "당월";

  const activeRanking =
    rankingPeriod === "month" ? data.channelRanking.month : data.channelRanking.threeMonth;

  return (
    <div ref={reportRef} data-dashboard-screenshot className="space-y-5 bg-bg-base">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-text-primary">통합 리포트</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            채널·계정·수입/지출을 한눈에 확인
          </p>
        </div>
        <div className="flex flex-wrap gap-2" data-screenshot-hide>
          <Button
            onClick={handleExportScreenshot}
            disabled={loading || exporting}
            className="!bg-red-500 !text-white hover:!opacity-90"
          >
            {exporting ? "스크린샷 생성 중..." : "스크린샷 내보내기"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
          리포트 불러오는 중...
        </div>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto pb-1">
            <div className="grid min-w-[760px] grid-cols-5 gap-4">
              {summaryCards.map((card) => (
                <SummaryCardItem key={card.label} {...card} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-nowrap gap-2" data-screenshot-button-row>
                  {DASHBOARD_NET_PROFIT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      data-screenshot-button=""
                      onClick={() => setNetProfitPeriod(option.value)}
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-[1.3rem] py-2 text-body-sm font-semibold transition focus-ring-primary",
                        getDashboardNetProfitButtonClassName(
                          option.value,
                          netProfitPeriod === option.value
                        )
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-label-caps text-on-surface-variant">
                  {dashboardNetProfitLabel(netProfitPeriod)}
                </p>
                <p
                  className={cn(
                    "mt-2 text-headline-md font-semibold",
                    activeNetProfit >= 0 ? "text-primary-container" : "text-red-400"
                  )}
                >
                  {formatManwon(activeNetProfit)}
                </p>
              </div>
              <Link href="/finance" className="text-body-sm text-primary hover:underline">
                장부 보기 →
              </Link>
            </div>
          </div>

          {data.warnings.length > 0 && (
            <div className="rounded-xl border border-warning/40 bg-bg-surface p-5">
              <h2 className="text-body-lg font-semibold text-text-primary">경고 · 주의 항목</h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                유튜브 · 애드센스 · 채널 중 경고/삭제/비활성 상태
              </p>
              <div className="mt-4 space-y-2">
                {data.warnings.map((item) => (
                  <Link
                    key={`${item.source}-${item.id}`}
                    href={warningHref(item.source)}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle px-3 py-2.5 transition hover:bg-surface-container-high"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body-sm font-medium text-text-primary">{item.name}</span>
                      <span className="text-body-sm text-on-surface-variant">{item.sourceLabel}</span>
                    </div>
                    <StatusPill
                      variant={
                        item.status === "warning"
                          ? "warning"
                          : item.status === "deleted"
                            ? "inactive"
                            : "pending"
                      }
                    >
                      {warningStatusLabel(item.status)}
                    </StatusPill>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-2">
            <DashboardNetProfitChart data={data.netProfitTrend} />

            <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-body-lg font-semibold text-text-primary">수입 상위 채널</h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {rankingPeriod === "month"
                      ? `${calendarMonthLabel} 수입 기준 TOP 5`
                      : "최근 3개월 수입 기준 TOP 5"}
                  </p>
                </div>
                <div className="flex flex-nowrap gap-2" data-screenshot-button-row>
                  <button
                    type="button"
                    data-screenshot-button=""
                    onClick={() => setRankingPeriod("month")}
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-body-sm font-semibold transition",
                      rankingPeriod === "month"
                        ? "bg-primary-container text-text-primary glow-primary"
                        : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    당월
                  </button>
                  <button
                    type="button"
                    data-screenshot-button=""
                    onClick={() => setRankingPeriod("3m")}
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-body-sm font-semibold transition",
                      rankingPeriod === "3m"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    3개월
                  </button>
                </div>
              </div>
              <ChannelRankingList items={activeRanking} />
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <div>
                <h2 className="text-body-lg font-semibold text-text-primary">채널 현황</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  유튜브 · 애드센스 연결 정보 포함
                </p>
              </div>
              <Link href="/channels" className="text-body-sm text-primary hover:underline">
                채널 관리 →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-body-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-label-caps text-on-surface-variant">
                    <th className="px-4 py-3 font-semibold">채널명</th>
                    <th className="px-4 py-3 font-semibold">형식</th>
                    <th className="px-4 py-3 font-semibold">상태</th>
                    <th className="px-4 py-3 font-semibold">유튜브</th>
                    <th className="px-4 py-3 font-semibold">애드센스</th>
                    <th className="px-4 py-3 font-semibold">수입</th>
                  </tr>
                </thead>
                <tbody>
                  {data.channels.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">
                        등록된 채널이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    data.channels.map((channel) => (
                      <tr key={channel.id} className="border-b border-border-subtle/60">
                        <td className="px-4 py-3 align-middle">
                          <div className="font-medium text-text-primary">{channel.name}</div>
                          <div className="text-on-surface-variant">{channel.handle}</div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <ContentFormatBadge format={channel.contentFormat} size="sm" />
                        </td>
                        <td className="px-4 py-3 align-middle text-on-surface-variant">
                          {statusLabel(channel.status)}
                        </td>
                        <td className="px-4 py-3 align-middle text-on-surface-variant">
                          {channel.youtubeAccountLabel || "—"}
                        </td>
                        <td className="px-4 py-3 align-middle text-on-surface-variant">
                          {channel.adsenseAccountLabel || "—"}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          {channel.hasRevenue ? (
                            <span className="text-primary-container">발생</span>
                          ) : (
                            <span className="text-on-surface-variant">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <div>
                <h2 className="text-body-lg font-semibold text-text-primary">최근 거래</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">최신 수입 · 지출 8건</p>
              </div>
              <Link href="/finance" className="text-body-sm text-primary hover:underline">
                전체 장부 →
              </Link>
            </div>
            <div className="divide-y divide-border-subtle/60">
              {data.recentTransactions.length === 0 ? (
                <p className="px-5 py-10 text-center text-body-sm text-on-surface-variant">
                  최근 거래가 없습니다.
                </p>
              ) : (
                data.recentTransactions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text-primary">{item.description}</p>
                      <p className="truncate text-body-sm text-on-surface-variant">
                        {formatShortDate(item.date)}
                        {item.category ? ` · ${item.category}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                      <span className="text-body-sm text-on-surface-variant">
                        {item.type === "income" ? "수입" : "지출"}
                      </span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          item.type === "income" ? "text-primary-container" : "text-warning"
                        )}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatManwon(item.amountKrw)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
