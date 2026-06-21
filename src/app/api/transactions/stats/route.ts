import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getTransactionStats, type TransactionPeriod } from "@/lib/transaction-service";

function parsePeriod(value: string | null): TransactionPeriod | undefined {
  if (value === "all" || value === "month" || value === "1w" || value === "today" || value === "3m" || value === "1y") {
    return value;
  }
  return undefined;
}

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const searchParams = new URL(request.url).searchParams;
    const month = searchParams.get("month") ?? undefined;
    const period = parsePeriod(searchParams.get("period"));
    const referenceDate = searchParams.get("referenceDate") ?? undefined;
    const stats = await getTransactionStats({ month, period, referenceDate });
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "통계를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
