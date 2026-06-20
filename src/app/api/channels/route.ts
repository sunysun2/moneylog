import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { createChannel, listChannels, sanitizeChannelPayload } from "@/lib/channel-service";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const channels = await listChannels();
    return NextResponse.json(channels);
  } catch {
    return NextResponse.json(
      { error: "채널 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await request.json();
    const channel = await createChannel(sanitizeChannelPayload(body));
    return NextResponse.json(channel, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "채널을 추가하지 못했습니다." },
      { status: 500 }
    );
  }
}
