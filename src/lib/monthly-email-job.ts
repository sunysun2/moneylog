import { getDashboardData } from "@/lib/dashboard-service";
import {
  getEmailSchedule,
  markEmailSent,
  type EmailScheduleData,
} from "@/lib/email-schedule-service";
import { isEmailConfigured, sendEmail } from "@/lib/email-service";
import {
  buildMonthlyReportEmailHtml,
  buildMonthlyReportEmailText,
  buildMonthlyReportSubject,
} from "@/lib/monthly-report-email";
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
}

export async function sendMonthlyReportEmail(
  schedule: EmailScheduleData,
  monthKey: string,
  options?: { markSent?: boolean }
): Promise<void> {
  const referenceDate = `${monthKey}-01`;
  const dashboardData = await getDashboardData(referenceDate);

  await sendEmail({
    to: schedule.recipientEmail,
    subject: buildMonthlyReportSubject(dashboardData),
    html: buildMonthlyReportEmailHtml(dashboardData),
    text: buildMonthlyReportEmailText(dashboardData),
  });

  if (options?.markSent !== false) {
    await markEmailSent(monthKey);
  }
}

export async function runMonthlyEmailJob(): Promise<MonthlyEmailJobResult> {
  const schedule = await getEmailSchedule();

  if (!schedule.enabled) {
    return { sent: false, skipped: "disabled" };
  }

  if (!schedule.recipientEmail) {
    return { sent: false, skipped: "no_recipient" };
  }

  if (!isEmailConfigured()) {
    return { sent: false, skipped: "smtp_not_configured" };
  }

  const seoulNow = getSeoulDateParts();
  const monthKey = formatSeoulMonthKey(new Date());

  if (schedule.lastSentMonthKey === monthKey) {
    return { sent: false, skipped: "already_sent", monthKey };
  }

  if (!shouldAttemptSeoulMonthlySend(schedule.dayOfMonth, seoulNow)) {
    return { sent: false, skipped: "before_scheduled_day", monthKey };
  }

  await sendMonthlyReportEmail(schedule, monthKey);

  return {
    sent: true,
    monthKey,
    recipientEmail: schedule.recipientEmail,
  };
}
