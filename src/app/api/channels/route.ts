import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { createChannel, listChannels, sanitizeChannelPayload } from "@/lib/channel-service";

export async function GET() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const channels = await listChannels(ctx);
    return NextResponse.json(channels);
  } catch {
    return NextResponse.json(
      { error: "?? ??? ???? ?????." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const body = await request.json();
    const channel = await createChannel(ctx, sanitizeChannelPayload(body));
    return NextResponse.json(channel, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "??? ???? ?????." },
      { status: 500 }
    );
  }
}
