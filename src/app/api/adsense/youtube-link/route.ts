import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { findYoutubeLinks } from "@/lib/adsense-service";

export async function GET(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const params = new URL(request.url).searchParams;
  const accountId = params.get("accountId")?.trim();
  const youtubeAccount = params.get("youtubeAccount")?.trim();
  const youtubeAccountId = params.get("youtubeAccountId")?.trim();

  if (!accountId && !youtubeAccount && !youtubeAccountId) {
    return NextResponse.json(
      { error: "?? ??? ??? ?? ????." },
      { status: 400 }
    );
  }

  try {
    const links = await findYoutubeLinks(ctx, {
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
      { error: "??? ?? ?? ??? ???? ?????." },
      { status: 500 }
    );
  }
}
