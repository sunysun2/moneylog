import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { deleteChannel, sanitizeChannelPayload, updateChannel } from "@/lib/channel-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const channel = await updateChannel(id, sanitizeChannelPayload(body));

    if (!channel) {
      return NextResponse.json({ error: "채널을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (err) {
    console.error("Channel update failed:", err);
    return NextResponse.json(
      { error: "채널을 수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const deleted = await deleteChannel(id);
    if (!deleted) {
      return NextResponse.json({ error: "채널을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "채널을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
