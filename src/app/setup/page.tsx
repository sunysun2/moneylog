"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export default function SetupPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("admin");
  const [nickname, setNickname] = useState("관리자");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const showingRecoveryKeyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || showingRecoveryKeyRef.current) return;
        if (data.isSetupComplete) {
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
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
      body: JSON.stringify({ loginId, nickname, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "설정에 실패했습니다.");
      return;
    }

    if (!data.recoveryKey) {
      setError("복구 키를 받지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    showingRecoveryKeyRef.current = true;
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
          <div className="mt-6 rounded-lg border border-primary/30 bg-surface-container-lowest p-4 text-center font-data-mono text-lg tracking-widest text-primary select-all">
            {recoveryKey}
          </div>
          <p className="mt-2 text-center text-body-sm text-text-muted">
            이 화면을 벗어나면 다시 볼 수 없습니다. 반드시 복사해 두세요.
          </p>
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
        <h1 className="text-display text-primary-container">MoneyLog</h1>
        <p className="mt-2 text-body-sm text-text-muted">최초 1회 관리자 계정 설정</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="관리자 아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
            required
            placeholder="영문, 숫자, _ (3~20자)"
          />
          <Input
            label="디하클 닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
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
