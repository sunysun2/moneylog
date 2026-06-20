"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function RecoverPage() {
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recoveryKey, newPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "재설정에 실패했습니다.");
      return;
    }

    setMessage(data.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-8">
        <h1 className="text-headline-md text-text-primary">비상 복구</h1>
        <p className="mt-2 text-body-sm text-text-muted">
          초기 설정 시 발급받은 24자리 복구 키로 비밀번호를 재설정합니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="비상 복구 키"
            value={recoveryKey}
            onChange={(e) => setRecoveryKey(e.target.value)}
            required
            sensitive
          />
          <Input
            label="새 비밀번호"
            type="password"
            convertHangulToQwerty
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            label="새 비밀번호 확인"
            type="password"
            convertHangulToQwerty
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            error={error}
          />

          {message && <p className="text-body-sm text-primary">{message}</p>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "처리 중..." : "비밀번호 재설정"}
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
