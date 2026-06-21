import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/models/User";

export async function requireOwnerContext() {
  const result = await requireSession();
  if (result.error) {
    return { ctx: null, session: null, error: result.error };
  }
  return {
    ctx: sessionOwnerContext(result.session!),
    session: result.session,
    error: null,
  };
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };

  if (session!.user.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }),
    };
  }

  return { session, error: null };
}

export function sessionOwnerContext(session: {
  user: { id: string; role: UserRole };
}) {
  return {
    ownerId: session.user.id,
    isAdmin: session.user.role === "admin",
  };
}
