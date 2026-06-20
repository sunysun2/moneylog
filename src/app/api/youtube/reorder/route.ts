import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { reorderYoutubeAccounts } from "@/lib/youtube-service";

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const { items } = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    await reorderYoutubeAccounts(items);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "순서를 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
