import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export function usesSecureAuthCookies(request?: NextRequest): boolean {
  if (process.env.NEXTAUTH_URL?.startsWith("https://")) {
    return true;
  }
  return request?.nextUrl.protocol === "https:";
}

export async function getAuthToken(request: NextRequest) {
  return getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: usesSecureAuthCookies(request),
  });
}
