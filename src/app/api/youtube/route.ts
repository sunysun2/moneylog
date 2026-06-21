import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { createYoutubeAccount, listYoutubeAccounts } from "@/lib/youtube-service";

export async function GET() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const accounts = await listYoutubeAccounts(ctx);
    return NextResponse.json(accounts);
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
    const account = await createYoutubeAccount(ctx, {
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
      { error: "??? ???? ?????." },
      { status: 500 }
    );
  }
}
