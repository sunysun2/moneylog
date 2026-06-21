"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

function resolveCallbackUrl(raw: string | null): string {
  if (!raw || raw === "/") {
    return "/dashboard";
  }
  return raw;
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"));

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        loginId,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setError("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          console.error("[login] signIn error:", result.error);
        }
        return;
      }

      if (!result?.ok) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const session = (await sessionRes.json()) as { user?: { loginId?: string } };

      if (!session?.user?.loginId) {
        setError(
          "로그인 세션을 만들지 못했습니다. Cloudtype 환경 변수 NEXTAUTH_URL과 AUTH_TRUST_HOST를 확인한 뒤 재배포해 주세요."
        );
        return;
      }

      window.location.assign(callbackUrl);
    } catch (submitError) {
      console.error("[login] submit failed:", submitError);
      setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-8">
        <h1 className="text-display text-primary-container">MoneyLog</h1>
        <p className="mt-2 text-body-sm text-text-muted">아이디와 비밀번호로 로그인</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="비밀번호"
            type="password"
            convertHangulToQwerty
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            error={error}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          비밀번호를 잊으셨나요?{" "}
          <Link href="/recover" className="text-primary hover:underline">
            비상 복구
          </Link>
        </p>
        <p className="mt-2 text-center text-body-sm text-text-muted">
          계정이 없나요?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            가입 신청
          </Link>
        </p>
        <p className="mt-2 text-center text-body-sm text-text-muted">
          탈퇴가 필요하신가요?{" "}
          <Link href="/withdraw" className="text-primary hover:underline">
            회원 탈퇴
          </Link>
        </p>
      </div>
    </div>
  );
}
