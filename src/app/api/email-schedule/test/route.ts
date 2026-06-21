import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getEmailSchedule } from "@/lib/email-schedule-service";
import { isEmailConfigured } from "@/lib/email-service";
import { sendMonthlyReportEmail } from "@/lib/monthly-email-job";
import { formatSeoulMonthKey } from "@/lib/seoul-time";

export async function POST() {
  const { error } = await requireSession();
  if (error) return error;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "SMTP 환경 변수가 설정되지 않았습니다." },
      { status: 400 }
    );
  }

  try {
    const schedule = await getEmailSchedule();

    if (!schedule.recipientEmail) {
      return NextResponse.json(
        { error: "수신 이메일을 입력한 뒤 설정 저장을 먼저 해 주세요." },
        { status: 400 }
      );
    }

    const monthKey = formatSeoulMonthKey();
    await sendMonthlyReportEmail(schedule, monthKey, { markSent: false });

    return NextResponse.json({
      success: true,
      monthKey,
      recipientEmail: schedule.recipientEmail,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "테스트 메일 발송에 실패했습니다." }, { status: 500 });
  }
}
