import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { createYoutubeAccount, listYoutubeAccounts } from "@/lib/youtube-service";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const accounts = await listYoutubeAccounts();
    return NextResponse.json(accounts);
  } catch {
    return NextResponse.json(
      { error: "계정 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await request.json();
    const account = await createYoutubeAccount({
      ...body,
      createdDate: body.createdDate ? new Date(body.createdDate) : undefined,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
      accountCreatedDate: body.accountCreatedDate
        ? new Date(body.accountCreatedDate)
        : undefined,
    });
    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "계정을 추가하지 못했습니다." },
      { status: 500 }
    );
  }
}
