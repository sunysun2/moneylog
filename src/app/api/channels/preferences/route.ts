import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import {
  getChannelPreferences,
  updateChannelPreferences,
} from "@/lib/channel-preference-service";

export async function GET() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const preferences = await getChannelPreferences(ctx);
    return NextResponse.json(preferences);
  } catch {
    return NextResponse.json(
      { error: "??? ???? ?????." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const body = await request.json();
    const preferences = await updateChannelPreferences(ctx, body);
    return NextResponse.json(preferences);
  } catch {
    return NextResponse.json(
      { error: "??? ???? ?????." },
      { status: 500 }
    );
  }
}
