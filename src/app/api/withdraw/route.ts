import { NextResponse } from "next/server";
import { withdrawByCredentials } from "@/lib/user-account-service";
import { validateLoginId } from "@/lib/validate-auth-fields";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginId = String(body.loginId ?? "");
    const password = String(body.password ?? "");

    const loginIdError = validateLoginId(loginId);
    if (loginIdError) {
      return NextResponse.json({ error: loginIdError }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "비밀번호를 입력해 주세요." }, { status: 400 });
    }

    await withdrawByCredentials(loginId, password);

    return NextResponse.json({
      message: "회원 탈퇴가 완료되었습니다. 저장된 데이터는 모두 삭제되었습니다.",
    });
  } catch (err) {
    console.error(err);
    const code = err instanceof Error ? err.message : "";

    if (code === "INVALID_CREDENTIALS") {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
    if (code === "ADMIN_CANNOT_WITHDRAW") {
      return NextResponse.json(
        { error: "관리자 계정은 이 화면에서 탈퇴할 수 없습니다." },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: "회원 탈퇴에 실패했습니다." }, { status: 500 });
  }
}
