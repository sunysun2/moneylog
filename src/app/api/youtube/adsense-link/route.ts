import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { findAdsenseLinkById } from "@/lib/adsense-service";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const adsenseAccountId = new URL(request.url).searchParams
    .get("adsenseAccountId")
    ?.trim();

  if (!adsenseAccountId) {
    return NextResponse.json(
      { error: "애드센스 계정 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const link = await findAdsenseLinkById(adsenseAccountId);
    if (!link) {
      return NextResponse.json({ linked: false });
    }

    return NextResponse.json({ linked: true, ...link });
  } catch {
    return NextResponse.json(
      { error: "애드센스 계정 연동 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
