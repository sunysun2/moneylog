import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { reorderYoutubeAccounts } from "@/lib/youtube-service";

export async function PATCH(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const { items } = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "??? ?????." }, { status: 400 });
    }

    await reorderYoutubeAccounts(ctx, items);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "??? ???? ?????." },
      { status: 500 }
    );
  }
}
