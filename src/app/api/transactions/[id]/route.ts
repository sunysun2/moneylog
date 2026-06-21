import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { deleteTransaction, sanitizeTransactionPayload, updateTransaction } from "@/lib/transaction-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const transaction = await updateTransaction(ctx, id, sanitizeTransactionPayload(body));

    if (!transaction) {
      return NextResponse.json({ error: "거래를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "거래를 수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const { id } = await context.params;

  try {
    const deleted = await deleteTransaction(ctx, id);
    if (!deleted) {
      return NextResponse.json({ error: "거래를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "거래를 삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
