import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { runMonthlyEmailJob } from "@/lib/monthly-email-job";

async function handleRequest(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET 환경 변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "인증되지 않은 cron 요청입니다." }, { status: 401 });
  }

  try {
    const result = await runMonthlyEmailJob();

    if (result.sent) {
      return NextResponse.json({
        success: true,
        sent: true,
        monthKey: result.monthKey,
        recipientEmail: result.recipientEmail,
      });
    }

    return NextResponse.json({
      success: true,
      sent: false,
      skipped: result.skipped,
      monthKey: result.monthKey,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "월간 이메일 작업에 실패했습니다." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}
