import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { getTransactionStats, type TransactionPeriod } from "@/lib/transaction-service";

function parsePeriod(value: string | null): TransactionPeriod | undefined {
  if (value === "all" || value === "month" || value === "1w" || value === "today" || value === "3m" || value === "1y") {
    return value;
  }
  return undefined;
}

export async function GET(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const searchParams = new URL(request.url).searchParams;
    const month = searchParams.get("month") ?? undefined;
    const period = parsePeriod(searchParams.get("period"));
    const referenceDate = searchParams.get("referenceDate") ?? undefined;
    const stats = await getTransactionStats(ctx, { month, period, referenceDate });
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "??? ???? ?????." },
      { status: 500 }
    );
  }
}
