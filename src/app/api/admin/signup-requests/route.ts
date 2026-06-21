import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  countActiveUsers,
  listSignupRequests,
} from "@/lib/signup-request-service";
import { MAX_APP_USERS } from "@/lib/auth-constants";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const pending = await listSignupRequests("pending");
    const activeUsers = await countActiveUsers();

    return NextResponse.json({
      pending,
      activeUsers,
      maxUsers: MAX_APP_USERS,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "가입 신청 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
