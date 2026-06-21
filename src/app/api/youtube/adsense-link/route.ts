import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { findAdsenseLinkById } from "@/lib/adsense-service";

export async function GET(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const adsenseAccountId = new URL(request.url).searchParams
    .get("adsenseAccountId")
    ?.trim();

  if (!adsenseAccountId) {
    return NextResponse.json(
      { error: "???? ?? ID? ?????." },
      { status: 400 }
    );
  }

  try {
    const link = await findAdsenseLinkById(ctx, adsenseAccountId);
    if (!link) {
      return NextResponse.json({ linked: false });
    }

    return NextResponse.json({ linked: true, ...link });
  } catch {
    return NextResponse.json(
      { error: "???? ?? ?? ??? ???? ?????." },
      { status: 500 }
    );
  }
}
