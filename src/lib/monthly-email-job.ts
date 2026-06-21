import { getDashboardData } from "@/lib/dashboard-service";
import {
  getEmailSchedule,
  listEnabledEmailSchedules,
  markEmailSent,
  type EmailScheduleData,
} from "@/lib/email-schedule-service";
import { isEmailConfigured, sendEmail } from "@/lib/email-service";
import {
  buildMonthlyReportEmailHtml,
  buildMonthlyReportEmailText,
  buildMonthlyReportSubject,
} from "@/lib/monthly-report-email";
import type { OwnerContext } from "@/lib/owner-query";
import {
  formatSeoulMonthKey,
  getSeoulDateParts,
  shouldAttemptSeoulMonthlySend,
} from "@/lib/seoul-time";

export type MonthlyEmailSkipReason =
  | "disabled"
  | "no_recipient"
  | "smtp_not_configured"
  | "before_scheduled_day"
  | "already_sent";

export interface MonthlyEmailJobResult {
  sent: boolean;
  skipped?: MonthlyEmailSkipReason;
  monthKey?: string;
  recipientEmail?: string;
  processed?: number;
}

export async function sendMonthlyReportEmail(
  ctx: OwnerContext,
  schedule: EmailScheduleData,
  monthKey: string,
  options?: { markSent?: boolean }
): Promise<void> {
  const referenceDate = `${monthKey}-01`;
  const dashboardData = await getDashboardData(ctx, referenceDate);

  await sendEmail({
    to: schedule.recipientEmail,
    subject: buildMonthlyReportSubject(dashboardData),
    html: buildMonthlyReportEmailHtml(dashboardData),
    text: buildMonthlyReportEmailText(dashboardData),
  });

  if (options?.markSent !== false) {
    await markEmailSent(ctx, monthKey);
  }
}

export async function runMonthlyEmailJob(
  ctx?: OwnerContext
): Promise<MonthlyEmailJobResult> {
  if (!isEmailConfigured()) {
    return { sent: false, skipped: "smtp_not_configured" };
  }

  const seoulNow = getSeoulDateParts();
  const monthKey = formatSeoulMonthKey(new Date());

  if (ctx) {
    return runMonthlyEmailJobForOwner(ctx, monthKey, seoulNow);
  }

  const schedules = await listEnabledEmailSchedules();
  if (schedules.length === 0) {
    return { sent: false, skipped: "disabled", monthKey };
  }

  let sentCount = 0;
  for (const { ctx: ownerCtx, schedule } of schedules) {
    const result = await runMonthlyEmailJobForOwner(ownerCtx, monthKey, seoulNow, schedule);
    if (result.sent) sentCount += 1;
  }

  return {
    sent: sentCount > 0,
    monthKey,
    processed: sentCount,
    skipped: sentCount === 0 ? "before_scheduled_day" : undefined,
  };
}

async function runMonthlyEmailJobForOwner(
  ctx: OwnerContext,
  monthKey: string,
  seoulNow: ReturnType<typeof getSeoulDateParts>,
  scheduleOverride?: EmailScheduleData
): Promise<MonthlyEmailJobResult> {
  const schedule = scheduleOverride ?? (await getEmailSchedule(ctx));

  if (!schedule.enabled) {
    return { sent: false, skipped: "disabled" };
  }

  if (!schedule.recipientEmail) {
    return { sent: false, skipped: "no_recipient" };
  }

  if (schedule.lastSentMonthKey === monthKey) {
    return { sent: false, skipped: "already_sent", monthKey };
  }

  if (!shouldAttemptSeoulMonthlySend(schedule.dayOfMonth, seoulNow)) {
    return { sent: false, skipped: "before_scheduled_day", monthKey };
  }

  await sendMonthlyReportEmail(ctx, schedule, monthKey);

  return {
    sent: true,
    monthKey,
    recipientEmail: schedule.recipientEmail,
  };
}
