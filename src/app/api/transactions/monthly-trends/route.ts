import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getMonthlyTrends, type TransactionPeriod } from "@/lib/transaction-service";

function parsePeriod(value: string | null): TransactionPeriod {
  if (value === "all" || value === "month" || value === "3m" || value === "1y") {
    return value;
  }
  return "1y";
}

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const period = parsePeriod(new URL(request.url).searchParams.get("period"));
    const trends = await getMonthlyTrends(period);
    return NextResponse.json(trends);
  } catch {
    return NextResponse.json(
      { error: "월별 통계를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
