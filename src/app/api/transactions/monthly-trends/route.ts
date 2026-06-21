import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getMonthlyTrends, type TransactionPeriod } from "@/lib/transaction-service";
import type { TransactionType } from "@/models/Transaction";

function parsePeriod(value: string | null): TransactionPeriod {
  if (value === "all" || value === "month" || value === "1w" || value === "today" || value === "3m" || value === "1y") {
    return value;
  }
  return "1y";
}

function parseType(value: string | null): TransactionType | undefined {
  if (value === "income" || value === "expense") return value;
  return undefined;
}

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const searchParams = new URL(request.url).searchParams;
    const period = parsePeriod(searchParams.get("period"));
    const type = parseType(searchParams.get("type"));
    const trends = await getMonthlyTrends(period, type);
    return NextResponse.json(trends);
  } catch {
    return NextResponse.json(
      { error: "월별 통계를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
