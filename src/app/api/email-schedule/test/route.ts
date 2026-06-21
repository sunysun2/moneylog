import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { getEmailSchedule } from "@/lib/email-schedule-service";
import { isEmailConfigured } from "@/lib/email-service";
import { sendMonthlyReportEmail } from "@/lib/monthly-email-job";
import { formatSeoulMonthKey } from "@/lib/seoul-time";

export async function POST() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "SMTP ?? ??? ???? ?????." },
      { status: 400 }
    );
  }

  try {
    const schedule = await getEmailSchedule(ctx);

    if (!schedule.recipientEmail) {
      return NextResponse.json(
        { error: "?? ???? ??? ? ?? ??? ?? ? ???." },
        { status: 400 }
      );
    }

    const monthKey = formatSeoulMonthKey();
    await sendMonthlyReportEmail(ctx, schedule, monthKey, { markSent: false });

    return NextResponse.json({
      success: true,
      monthKey,
      recipientEmail: schedule.recipientEmail,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "??? ?? ??? ??????." }, { status: 500 });
  }
}
