import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { findYoutubeLinks } from "@/lib/adsense-service";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const params = new URL(request.url).searchParams;
  const accountId = params.get("accountId")?.trim();
  const youtubeAccount = params.get("youtubeAccount")?.trim();
  const youtubeAccountId = params.get("youtubeAccountId")?.trim();

  if (!accountId && !youtubeAccount && !youtubeAccountId) {
    return NextResponse.json(
      { error: "연동 조회에 필요한 값이 없습니다." },
      { status: 400 }
    );
  }

  try {
    const links = await findYoutubeLinks({
      accountId,
      youtubeAccount,
      youtubeAccountId,
    });

    if (links.length === 0) {
      return NextResponse.json({ linked: false, count: 0, links: [] });
    }

    const first = links[0];

    return NextResponse.json({
      linked: true,
      count: links.length,
      links,
      ...first,
    });
  } catch {
    return NextResponse.json(
      { error: "유튜브 계정 연동 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
