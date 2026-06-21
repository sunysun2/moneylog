import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import {
  deleteAdsenseAccount,
  updateAdsenseAccount,
} from "@/lib/adsense-service";

type RouteContext = { params: Promise<{ id: string }> };

function parseDates(body: Record<string, unknown>) {
  return {
    ...body,
    appliedDate: body.appliedDate ? new Date(String(body.appliedDate)) : undefined,
    arrivedDate: body.arrivedDate ? new Date(String(body.arrivedDate)) : undefined,
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const account = await updateAdsenseAccount(ctx, id, parseDates(body));

    if (!account) {
      return NextResponse.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch {
    return NextResponse.json(
      { error: "계정을 수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const { id } = await context.params;

  try {
    const deleted = await deleteAdsenseAccount(ctx, id);
    if (!deleted) {
      return NextResponse.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "계정을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
