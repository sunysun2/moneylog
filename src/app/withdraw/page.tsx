"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button, Input } from "@/components/ui";
import { validateLoginId } from "@/lib/validate-auth-fields";

export default function WithdrawPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const loginIdError = validateLoginId(loginId);
    if (loginIdError) {
      setError(loginIdError);
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    const confirmed = window.confirm(
      "회원 탈퇴 시 계정과 저장된 모든 데이터가 삭제됩니다.\n정말 탈퇴하시겠습니까?"
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? "회원 탈퇴에 실패했습니다.");
        return;
      }

      await signOut({ redirect: false });
      setSuccess(data.message ?? "회원 탈퇴가 완료되었습니다.");
      setLoginId("");
      setPassword("");
    } catch {
      setError("회원 탈퇴에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-8">
          <h1 className="text-headline-md text-text-primary">탈퇴 완료</h1>
          <p className="mt-3 text-body-sm text-on-surface-variant">{success}</p>
          <Button className="mt-6" fullWidth onClick={() => (window.location.href = "/login")}>
            로그인으로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-8">
        <h1 className="text-center text-display text-primary-container">MoneyLog</h1>
        <h2 className="mt-2 text-center text-headline-md text-text-primary">회원 탈퇴</h2>
        <p className="mt-2 text-center text-body-sm text-on-surface-variant">
          아이디와 비밀번호를 입력하면 탈퇴할 수 있습니다.
        </p>
        <p className="mt-1 text-center text-body-sm text-text-muted">
          탈퇴 시 계정과 저장된 모든 데이터가 삭제됩니다.
        </p>

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

          <Button type="submit" variant="danger" fullWidth disabled={loading}>
            {loading ? "처리 중..." : "회원 탈퇴"}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          <Link href="/login" className="text-primary hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
