import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getEmailSchedule, upsertEmailSchedule } from "@/lib/email-schedule-service";
import { isEmailConfigured } from "@/lib/email-service";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const schedule = await getEmailSchedule();
    return NextResponse.json({
      ...schedule,
      smtpConfigured: isEmailConfigured(),
      cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "이메일 설정을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await request.json();
    const enabled = Boolean(body.enabled);
    const recipientEmail = String(body.recipientEmail ?? "").trim();
    const dayOfMonth = Number(body.dayOfMonth ?? 1);

    if (enabled && !recipientEmail) {
      return NextResponse.json({ error: "수신 이메일을 입력해 주세요." }, { status: 400 });
    }

    if (recipientEmail && !isValidEmail(recipientEmail)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력해 주세요." }, { status: 400 });
    }

    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return NextResponse.json(
        { error: "발송일은 1~31일 사이로 설정해 주세요." },
        { status: 400 }
      );
    }

    const schedule = await upsertEmailSchedule({
      enabled,
      recipientEmail,
      dayOfMonth,
    });

    return NextResponse.json({
      ...schedule,
      smtpConfigured: isEmailConfigured(),
      cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "이메일 설정을 저장하지 못했습니다." }, { status: 500 });
  }
}
