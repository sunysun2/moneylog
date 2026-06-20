"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { notify } from "@/lib/notify";
import { Button, StatusPill } from "@/components/ui";
import { ContentFormatBadge } from "@/components/channels/ContentFormatBadge";
import { formatKrw } from "@/components/finance/types";
import { statusLabel } from "@/components/channels/types";
import { DashboardNetProfitChart } from "./DashboardNetProfitChart";
import type { DashboardData } from "./types";

const EMPTY_DATA: DashboardData = {
  summary: {
    totalChannels: 0,
    revenueChannels: 0,
    activeAdsense: 0,
    activeYoutube: 0,
    totalPhones: 0,
    monthIncome: 0,
    monthExpense: 0,
    monthNetProfit: 0,
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

export function DashboardView() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>("month");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      notify.error("통합 리포트를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleExportPdf() {
    if (!reportRef.current) return;

    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#000000",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`moneylog-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      notify.success("PDF 리포트를 저장했습니다.");
    } catch {
      notify.error("PDF 내보내기에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  }

  function handleExportMarkdown() {
    const { summary, warnings, channelRanking, recentTransactions, netProfitTrend } = data;
    const lines = [
      "# MoneyLog 통합 리포트",
      "",
      `생성일: ${new Date().toISOString().slice(0, 10)}`,
      "",
      "## 요약",
      `- 총 채널: ${summary.totalChannels}`,
      `- 수창 채널: ${summary.revenueChannels}`,
      `- 활성 애드센스: ${summary.activeAdsense}`,
      `- 활성 유튜브: ${summary.activeYoutube}`,
      `- 휴대폰: ${summary.totalPhones}`,
      `- 당월 수입: ${formatKrw(summary.monthIncome)}`,
      `- 당월 지출: ${formatKrw(summary.monthExpense)}`,
      `- 당월 순이익: ${formatKrw(summary.monthNetProfit)}`,
      "",
      "## 경고 항목",
      ...(warnings.length
        ? warnings.map((item) => `- [${item.sourceLabel}] ${item.name} (${warningStatusLabel(item.status)})`)
        : ["- 없음"]),
      "",
      "## 수입 상위 채널 (당월)",
      ...(channelRanking.month.length
        ? channelRanking.month.map((item, index) => `${index + 1}. ${item.name}: ${formatKrw(item.income)}`)
        : ["- 없음"]),
      "",
      "## 수입 상위 채널 (최근 3개월)",
      ...(channelRanking.threeMonth.length
        ? channelRanking.threeMonth.map(
            (item, index) => `${index + 1}. ${item.name}: ${formatKrw(item.income)}`
          )
        : ["- 없음"]),
      "",
      "## 월별 순이익",
      ...netProfitTrend.map((point) => `- ${point.label}: ${formatKrw(point.netProfit)}`),
      "",
      "## 최근 거래",
      ...recentTransactions.map(
        (item) =>
          `- ${formatShortDate(item.date)} ${item.type === "income" ? "수입" : "지출"} ${item.description}: ${formatKrw(item.amountKrw)}`
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `moneylog-report-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify.success("Markdown 리포트를 저장했습니다.");
  }

  const summaryCards = [
    { label: "총 채널", value: String(data.summary.totalChannels), tone: "text-text-primary" },
    {
      label: "수창 채널",
      value: String(data.summary.revenueChannels),
      tone: "text-primary-container",
    },
    { label: "활성 애드센스", value: String(data.summary.activeAdsense), tone: "text-secondary-container" },
    { label: "당월 수입", value: formatKrw(data.summary.monthIncome), tone: "text-primary-container" },
    { label: "당월 지출", value: formatKrw(data.summary.monthExpense), tone: "text-warning" },
  ];

  const activeRanking =
    rankingPeriod === "month" ? data.channelRanking.month : data.channelRanking.threeMonth;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-text-primary">통합 리포트</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            채널·계정·수입/지출을 한눈에 확인
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={handleExportMarkdown} disabled={loading || exporting}>
            Markdown 내보내기
          </Button>
          <Button onClick={handleExportPdf} disabled={loading || exporting}>
            {exporting ? "PDF 생성 중..." : "PDF 내보내기"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
          리포트 불러오는 중...
        </div>
      ) : (
        <div ref={reportRef} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border-subtle bg-bg-surface p-5"
              >
                <p className="text-label-caps text-on-surface-variant">{card.label}</p>
                <p className={cn("mt-2 text-2xl font-bold", card.tone)}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-label-caps text-on-surface-variant">당월 순이익</p>
                <p
                  className={cn(
                    "mt-2 text-headline-md font-semibold",
                    data.summary.monthNetProfit >= 0 ? "text-primary-container" : "text-red-400"
                  )}
                >
                  {formatKrw(data.summary.monthNetProfit)}
                </p>
              </div>
              <Link
                href="/finance"
                className="text-body-sm text-primary hover:underline"
              >
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
                    {rankingPeriod === "month" ? "당월 수입 기준 TOP 5" : "최근 3개월 수입 기준 TOP 5"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setRankingPeriod("month")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-body-sm font-semibold transition",
                      rankingPeriod === "month"
                        ? "bg-primary-container text-text-primary glow-primary"
                        : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    당월
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingPeriod("3m")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-body-sm font-semibold transition",
                      rankingPeriod === "3m"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    3개월
                  </button>
                </div>
              </div>
              {activeRanking.length === 0 ? (
                <p className="mt-6 text-body-sm text-on-surface-variant">집계할 수입 데이터가 없습니다.</p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {activeRanking.map((item, index) => (
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
                        {formatKrw(item.income)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
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
                        <td className="px-4 py-3">
                          <div className="font-medium text-text-primary">{channel.name}</div>
                          <div className="text-on-surface-variant">{channel.handle}</div>
                        </td>
                        <td className="px-4 py-3">
                          <ContentFormatBadge format={channel.contentFormat} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {statusLabel(channel.status)}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {channel.youtubeAccountLabel || "—"}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {channel.adsenseAccountLabel || "—"}
                        </td>
                        <td className="px-4 py-3">
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
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{item.description}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {formatShortDate(item.date)}
                        {item.category ? ` · ${item.category}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-semibold",
                          item.type === "income" ? "text-primary-container" : "text-warning"
                        )}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatKrw(item.amountKrw)}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {item.type === "income" ? "수입" : "지출"}
                      </p>
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
