import { NextResponse } from "next/server";
import {
  createSignupRequest,
  isLoginIdTaken,
} from "@/lib/signup-request-service";
import {
  validateLoginId,
  validateNickname,
  validatePasswordPair,
} from "@/lib/validate-auth-fields";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginId = String(body.loginId ?? "");
    const password = String(body.password ?? "");
    const confirm = String(body.confirm ?? "");
    const nickname = String(body.nickname ?? "");

    const loginIdError = validateLoginId(loginId);
    if (loginIdError) {
      return NextResponse.json({ error: loginIdError }, { status: 400 });
    }

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      return NextResponse.json({ error: nicknameError }, { status: 400 });
    }

    const passwordError = validatePasswordPair(password, confirm);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (await isLoginIdTaken(loginId)) {
      return NextResponse.json(
        { error: "이미 사용 중이거나 승인 대기 중인 아이디입니다." },
        { status: 409 }
      );
    }

    const created = await createSignupRequest({ loginId, nickname, password });

    return NextResponse.json(
      {
        message: "가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.",
        requestId: created.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.message === "LOGIN_ID_TAKEN") {
      return NextResponse.json(
        { error: "이미 사용 중이거나 승인 대기 중인 아이디입니다." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "가입 신청에 실패했습니다." }, { status: 500 });
  }
}
