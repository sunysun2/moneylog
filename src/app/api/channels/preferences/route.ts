import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  getChannelPreferences,
  updateChannelPreferences,
} from "@/lib/channel-preference-service";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const preferences = await getChannelPreferences();
    return NextResponse.json(preferences);
  } catch {
    return NextResponse.json(
      { error: "설정을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await request.json();
    const preferences = await updateChannelPreferences(body);
    return NextResponse.json(preferences);
  } catch {
    return NextResponse.json(
      { error: "설정을 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
