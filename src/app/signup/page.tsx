"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import {
  validateLoginId,
  validateNickname,
  validatePasswordPair,
} from "@/lib/validate-auth-fields";

export default function SignupPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");
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

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setError(nicknameError);
      return;
    }

    const passwordError = validatePasswordPair(password, confirm);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId, password, confirm, nickname }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "가입 신청에 실패했습니다.");
      return;
    }

    setSuccess(data.message ?? "가입 신청이 접수되었습니다.");
    setLoginId("");
    setPassword("");
    setConfirm("");
    setNickname("");
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-8">
          <h1 className="text-headline-md text-text-primary">신청 완료</h1>
          <p className="mt-3 text-body-sm text-on-surface-variant">{success}</p>
          <Button className="mt-6" fullWidth onClick={() => router.push("/login")}>
            로그인으로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-8">
        <h1 className="text-center text-display text-text-primary">가입 신청</h1>
        <div className="mt-2 space-y-1 text-center text-body-sm text-text-muted">
          <p>관리자 승인 후 로그인할 수 있습니다.</p>
          <p>개인정보 및 데이터는 수집하지 않습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
            required
            placeholder="영문, 숫자, _ (3~20자)"
          />
          <Input
            label="비밀번호"
            type="password"
            convertHangulToQwerty
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            label="비밀번호 확인"
            type="password"
            convertHangulToQwerty
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
          <Input
            label="디하클 닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            placeholder="2~20자"
            error={error}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "신청 중..." : "가입 신청"}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
