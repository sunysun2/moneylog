import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
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
  const { error } = await requireSession();
  if (error) return error;

  try {
    const accounts = await listAdsenseAccounts();
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
    const account = await createAdsenseAccount(parseDates(body));
    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "계정을 추가하지 못했습니다." },
      { status: 500 }
    );
  }
}
