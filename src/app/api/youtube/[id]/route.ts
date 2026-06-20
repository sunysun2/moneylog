import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  deleteYoutubeAccount,
  updateYoutubeAccount,
} from "@/lib/youtube-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const account = await updateYoutubeAccount(id, {
      ...body,
      createdDate: body.createdDate ? new Date(body.createdDate) : undefined,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
      accountCreatedDate: body.accountCreatedDate
        ? new Date(body.accountCreatedDate)
        : undefined,
    });

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
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const deleted = await deleteYoutubeAccount(id);
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
