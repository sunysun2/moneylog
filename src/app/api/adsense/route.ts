import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import {
  createAdsenseAccount,
  listAdsenseAccounts,
} from "@/lib/adsense-service";

function parseDates(body: Record<string, unknown>) {
  return {
    ...body,
    appliedDate: body.appliedDate ? new Date(String(body.appliedDate)) : undefined,
    arrivedDate: body.arrivedDate ? new Date(String(body.arrivedDate)) : undefined,
  };
}

export async function GET() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const accounts = await listAdsenseAccounts(ctx);
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
    const account = await createAdsenseAccount(ctx, parseDates(body));
    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "??? ???? ?????." },
      { status: 500 }
    );
  }
}
