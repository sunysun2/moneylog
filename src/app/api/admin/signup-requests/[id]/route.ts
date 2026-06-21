import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { MAX_APP_USERS } from "@/lib/auth-constants";
import {
  approveSignupRequest,
  rejectSignupRequest,
} from "@/lib/signup-request-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  let action: string;
  try {
    const body = await request.json();
    action = String(body.action ?? "");
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "지원하지 않는 작업입니다." }, { status: 400 });
  }

  try {
    if (action === "approve") {
      await approveSignupRequest(id);
      return NextResponse.json({ success: true, action: "approved" });
    }

    await rejectSignupRequest(id);
    return NextResponse.json({ success: true, action: "rejected" });
  } catch (err) {
    console.error(err);
    const code = err instanceof Error ? err.message : "";

    if (code === "USER_LIMIT_REACHED") {
      return NextResponse.json(
        { error: `최대 ${MAX_APP_USERS}명까지 가입할 수 있습니다.` },
        { status: 400 }
      );
    }
    if (code === "LOGIN_ID_TAKEN") {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디라 승인할 수 없습니다." },
        { status: 409 }
      );
    }
    if (code === "REQUEST_NOT_FOUND") {
      return NextResponse.json({ error: "처리할 신청을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ error: "처리에 실패했습니다." }, { status: 500 });
  }
}
