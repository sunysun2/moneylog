"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, SensitiveData } from "@/components/ui";

export default function SetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSetupComplete) {
          router.replace("/login");
        }
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "설정에 실패했습니다.");
      return;
    }

    setRecoveryKey(data.recoveryKey);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base text-body-sm text-text-muted">
        확인 중...
      </div>
    );
  }

  if (recoveryKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
        <div className="w-full max-w-lg rounded-xl border border-border-subtle bg-bg-surface p-8">
          <h1 className="text-headline-md text-text-primary">초기 설정 완료</h1>
          <p className="mt-2 text-body-sm text-text-muted">
            아래 비상 복구 키를 안전한 곳에 보관하세요. 비밀번호 분실 시에만 사용합니다.
          </p>
          <SensitiveData className="mt-6 block rounded-lg border border-primary/30 bg-surface-container-lowest p-4 text-lg tracking-widest text-primary">
            {recoveryKey}
          </SensitiveData>
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
        <h1 className="text-display text-text-primary">MoneyLog</h1>
        <p className="mt-2 text-body-sm text-text-muted">최초 1회 마스터 비밀번호 설정</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="마스터 비밀번호"
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
            error={error}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "설정 중..." : "시작하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
