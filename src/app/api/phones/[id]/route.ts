import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  deletePhoneDevice,
  updatePhoneDevice,
} from "@/lib/phone-service";

type RouteContext = { params: Promise<{ id: string }> };

function parseBody(body: Record<string, unknown>) {
  return {
    ...body,
    purchaseDate: body.purchaseDate ? new Date(String(body.purchaseDate)) : undefined,
    paymentDay:
      body.paymentDay != null && body.paymentDay !== ""
        ? Number(body.paymentDay)
        : undefined,
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const device = await updatePhoneDevice(id, parseBody(body));

    if (!device) {
      return NextResponse.json({ error: "휴대폰을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch {
    return NextResponse.json(
      { error: "휴대폰을 수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const deleted = await deletePhoneDevice(id);
    if (!deleted) {
      return NextResponse.json({ error: "휴대폰을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "휴대폰을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
