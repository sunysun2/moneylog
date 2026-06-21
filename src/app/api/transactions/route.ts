import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  createTransaction,
  listTransactions,
  sanitizeTransactionPayload,
  type TransactionFilters,
  type TransactionPeriod,
} from "@/lib/transaction-service";
import type { TransactionType } from "@/models/Transaction";

function parsePeriod(value: string | null): TransactionPeriod | undefined {
  if (value === "all" || value === "month" || value === "1w" || value === "today" || value === "3m" || value === "1y") {
    return value;
  }
  return undefined;
}

function parseFilters(searchParams: URLSearchParams): TransactionFilters {
  const type = searchParams.get("type");
  const month = searchParams.get("month") ?? undefined;
  const period = parsePeriod(searchParams.get("period"));
  const referenceDate = searchParams.get("referenceDate") ?? undefined;

  return {
    month,
    period,
    referenceDate,
    type:
      type === "income" || type === "expense" ? (type as TransactionType) : undefined,
  };
}

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const filters = parseFilters(new URL(request.url).searchParams);
    const transactions = await listTransactions(filters);
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json(
      { error: "거래 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await request.json();
    const transaction = await createTransaction(sanitizeTransactionPayload(body));
    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "거래를 추가하지 못했습니다." },
      { status: 500 }
    );
  }
}
