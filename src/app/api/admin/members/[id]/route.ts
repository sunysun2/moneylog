import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { removeUserAccount } from "@/lib/user-account-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  if (session!.user.id === id) {
    return NextResponse.json(
      { error: "본인 계정은 이 메뉴에서 탈퇴할 수 없습니다." },
      { status: 400 }
    );
  }

  try {
    await removeUserAccount(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    const code = err instanceof Error ? err.message : "";

    if (code === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
    }
    if (code === "CANNOT_REMOVE_ADMIN") {
      return NextResponse.json(
        { error: "관리자 계정은 강제 탈퇴할 수 없습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "탈퇴 처리에 실패했습니다." }, { status: 500 });
  }
}
