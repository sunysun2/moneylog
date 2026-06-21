import type { DashboardData } from "@/components/dashboard/types";
import { formatKrw, formatManwon } from "@/components/finance/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function warningStatusLabel(status: DashboardData["warnings"][number]["status"]): string {
  switch (status) {
    case "warning":
      return "주의";
    case "deleted":
      return "삭제";
    case "inactive":
      return "비활성";
  }
}

function buildRankingSection(
  title: string,
  items: DashboardData["channelRanking"]["month"]
): string {
  if (items.length === 0) {
    return `<h3 style="margin:24px 0 8px;font-size:16px;color:#111827;">${escapeHtml(title)}</h3>
<p style="margin:0;color:#6b7280;">표시할 데이터가 없습니다.</p>`;
  }

  const rows = items
    .map(
      (item, index) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${index + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(item.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#059669;text-align:right;">${escapeHtml(formatManwon(item.income))}</td>
      </tr>`
    )
    .join("");

  return `<h3 style="margin:24px 0 8px;font-size:16px;color:#111827;">${escapeHtml(title)}</h3>
<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#f9fafb;">
      <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:12px;">#</th>
      <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:12px;">채널</th>
      <th style="padding:8px 12px;text-align:right;color:#6b7280;font-size:12px;">수입</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;
}

export function buildMonthlyReportSubject(data: DashboardData): string {
  return `[MoneyLog] ${data.calendarMonthLabel} 통합 리포트`;
}

export function buildMonthlyReportEmailHtml(data: DashboardData): string {
  const summaryCards = [
    { label: "채널", value: `${data.summary.totalChannels}개` },
    { label: "수익 채널", value: `${data.summary.revenueChannels}개` },
    { label: "애드센스", value: `${data.summary.activeAdsense}개` },
    { label: "유튜브", value: `${data.summary.activeYoutube}개` },
    { label: "휴대폰", value: `${data.summary.totalPhones}대` },
  ];

  const summaryHtml = summaryCards
    .map(
      (card) => `<td style="padding:12px;border:1px solid #e5e7eb;background:#fff;">
        <div style="font-size:12px;color:#6b7280;">${escapeHtml(card.label)}</div>
        <div style="margin-top:4px;font-size:18px;font-weight:700;color:#111827;">${escapeHtml(card.value)}</div>
      </td>`
    )
    .join("");

  const financeHtml = `
    <table style="width:100%;border-collapse:separate;border-spacing:12px 0;margin-top:8px;">
      <tr>
        <td style="padding:16px;border:1px solid #e5e7eb;background:#fff;border-radius:8px;">
          <div style="font-size:12px;color:#6b7280;">당월 수입</div>
          <div style="margin-top:4px;font-size:20px;font-weight:700;color:#059669;">${escapeHtml(formatManwon(data.summary.monthIncome))}</div>
        </td>
        <td style="padding:16px;border:1px solid #e5e7eb;background:#fff;border-radius:8px;">
          <div style="font-size:12px;color:#6b7280;">당월 지출</div>
          <div style="margin-top:4px;font-size:20px;font-weight:700;color:#d97706;">${escapeHtml(formatManwon(data.summary.monthExpense))}</div>
        </td>
        <td style="padding:16px;border:1px solid #e5e7eb;background:#fff;border-radius:8px;">
          <div style="font-size:12px;color:#6b7280;">당월 순이익</div>
          <div style="margin-top:4px;font-size:20px;font-weight:700;color:${data.summary.monthNetProfit >= 0 ? "#059669" : "#dc2626"};">${escapeHtml(formatManwon(data.summary.monthNetProfit))}</div>
        </td>
      </tr>
    </table>`;

  const warningsHtml =
    data.warnings.length === 0
      ? `<p style="margin:0;color:#6b7280;">주의 항목이 없습니다.</p>`
      : `<ul style="margin:0;padding-left:18px;color:#374151;">
          ${data.warnings
            .slice(0, 10)
            .map(
              (item) =>
                `<li style="margin-bottom:6px;">[${escapeHtml(item.sourceLabel)}] ${escapeHtml(item.name)} · ${escapeHtml(warningStatusLabel(item.status))}</li>`
            )
            .join("")}
        </ul>`;

  const recentTransactionsHtml =
    data.recentTransactions.length === 0
      ? `<p style="margin:0;color:#6b7280;">최근 거래가 없습니다.</p>`
      : `<table style="width:100%;border-collapse:collapse;">
          ${data.recentTransactions
            .slice(0, 8)
            .map(
              (item) => `<tr>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;">${escapeHtml(item.description)}</td>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;text-align:right;">${escapeHtml(item.type === "income" ? "수입" : "지출")}</td>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:${item.type === "income" ? "#059669" : "#d97706"};text-align:right;">${escapeHtml(formatManwon(item.amountKrw))}</td>
              </tr>`
            )
            .join("")}
        </table>`;

  return `<!DOCTYPE html>
<html lang="ko">
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#059669;font-weight:700;">MoneyLog</p>
      <h1 style="margin:0 0 8px;font-size:24px;">${escapeHtml(data.calendarMonthLabel)} 통합 리포트</h1>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">매월 자동 발송된 당월 요약입니다.</p>

      <h2 style="margin:0 0 12px;font-size:16px;">운영 현황</h2>
      <table style="width:100%;border-collapse:collapse;">${summaryHtml}</table>

      <h2 style="margin:24px 0 12px;font-size:16px;">당월 장부</h2>
      ${financeHtml}
      <p style="margin:12px 0 0;color:#6b7280;font-size:13px;">
        3개월 순이익 ${escapeHtml(formatManwon(data.summary.threeMonthNetProfit))} ·
        전체 순이익 ${escapeHtml(formatManwon(data.summary.allNetProfit))}
      </p>

      ${buildRankingSection("당월 수입 상위 채널 TOP 5", data.channelRanking.month)}

      <h2 style="margin:24px 0 8px;font-size:16px;">주의 항목</h2>
      ${warningsHtml}

      <h2 style="margin:24px 0 8px;font-size:16px;">최근 거래</h2>
      ${recentTransactionsHtml}

      <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
        본 메일은 MoneyLog에서 자동 발송되었습니다.
      </p>
    </div>
  </body>
</html>`;
}

export function buildMonthlyReportEmailText(data: DashboardData): string {
  const lines = [
    `[MoneyLog] ${data.calendarMonthLabel} 통합 리포트`,
    "",
    "[운영 현황]",
    `채널 ${data.summary.totalChannels}개 · 수익 채널 ${data.summary.revenueChannels}개`,
    `애드센스 ${data.summary.activeAdsense}개 · 유튜브 ${data.summary.activeYoutube}개 · 휴대폰 ${data.summary.totalPhones}대`,
    "",
    "[당월 장부]",
    `수입 ${formatManwon(data.summary.monthIncome)}`,
    `지출 ${formatManwon(data.summary.monthExpense)}`,
    `순이익 ${formatManwon(data.summary.monthNetProfit)}`,
    `3개월 순이익 ${formatManwon(data.summary.threeMonthNetProfit)} · 전체 순이익 ${formatManwon(data.summary.allNetProfit)}`,
    "",
    "[당월 수입 상위 채널]",
    ...(data.channelRanking.month.length > 0
      ? data.channelRanking.month.map(
          (item, index) => `${index + 1}. ${item.name} · ${formatManwon(item.income)}`
        )
      : ["표시할 데이터가 없습니다."]),
    "",
    "[주의 항목]",
    ...(data.warnings.length > 0
      ? data.warnings
          .slice(0, 10)
          .map(
            (item) =>
              `- [${item.sourceLabel}] ${item.name} · ${warningStatusLabel(item.status)}`
          )
      : ["주의 항목이 없습니다."]),
    "",
    "[최근 거래]",
    ...(data.recentTransactions.length > 0
      ? data.recentTransactions
          .slice(0, 8)
          .map(
            (item) =>
              `- ${item.description} · ${item.type === "income" ? "수입" : "지출"} · ${formatKrw(item.amountKrw)}`
          )
      : ["최근 거래가 없습니다."]),
  ];

  return lines.join("\n");
}
