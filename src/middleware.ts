import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthToken } from "@/lib/auth-token";

const publicPaths = [
  "/login",
  "/setup",
  "/recover",
  "/signup",
  "/withdraw",
  "/api/auth",
  "/api/setup",
  "/api/signup",
  "/api/withdraw",
  "/api/cron",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const token = await getAuthToken(request);

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/settings/email" ||
    pathname.startsWith("/settings/email/") ||
    pathname.startsWith("/api/email-schedule");

  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isPublic) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
