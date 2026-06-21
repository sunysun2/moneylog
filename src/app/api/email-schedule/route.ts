import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { getEmailSchedule, upsertEmailSchedule } from "@/lib/email-schedule-service";
import { isEmailConfigured } from "@/lib/email-service";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const schedule = await getEmailSchedule(ctx);
    return NextResponse.json({
      ...schedule,
      smtpConfigured: isEmailConfigured(),
      cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "??? ??? ???? ?????." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const body = await request.json();
    const enabled = Boolean(body.enabled);
    const recipientEmail = String(body.recipientEmail ?? "").trim();
    const dayOfMonth = Number(body.dayOfMonth ?? 1);

    if (enabled && !recipientEmail) {
      return NextResponse.json({ error: "?? ???? ??? ???." }, { status: 400 });
    }

    if (recipientEmail && !isValidEmail(recipientEmail)) {
      return NextResponse.json({ error: "??? ??? ??? ??? ???." }, { status: 400 });
    }

    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return NextResponse.json(
        { error: "???? 1~31? ??? ??? ???." },
        { status: 400 }
      );
    }

    const schedule = await upsertEmailSchedule(ctx, {
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
    return NextResponse.json({ error: "??? ??? ???? ?????." }, { status: 500 });
  }
}
