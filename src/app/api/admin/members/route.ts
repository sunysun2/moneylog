import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { MAX_APP_USERS } from "@/lib/auth-constants";
import { countActiveUsers } from "@/lib/signup-request-service";
import { listMembers } from "@/lib/user-account-service";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const members = await listMembers();
    const activeUsers = await countActiveUsers();

    return NextResponse.json({
      members,
      activeUsers,
      maxUsers: MAX_APP_USERS,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "회원 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
