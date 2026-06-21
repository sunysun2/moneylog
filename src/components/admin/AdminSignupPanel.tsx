"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { notify } from "@/lib/notify";

interface SignupRequestItem {
  id: string;
  loginId: string;
  nickname: string;
  createdAt: string;
}

interface AdminSignupResponse {
  pending: SignupRequestItem[];
  activeUsers: number;
  maxUsers: number;
  error?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminSignupPanel() {
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [data, setData] = useState<AdminSignupResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/signup-requests");
      const json = (await res.json()) as AdminSignupResponse;
      if (!res.ok) {
        notify.error(json.error ?? "목록을 불러오지 못했습니다.");
        return;
      }
      setData(json);
    } catch {
      notify.error("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/signup-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        notify.error(json?.error ?? "처리에 실패했습니다.");
        return;
      }

      notify.success(action === "approve" ? "가입을 승인했습니다." : "가입을 거절했습니다.");
      await load();
    } catch {
      notify.error("처리에 실패했습니다.");
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
        불러오는 중...
      </div>
    );
  }

  const pending = data?.pending ?? [];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-display text-text-primary">MoneyLog</h1>
        <h2 className="mt-2 text-headline-md text-text-primary">가입 승인</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          승인 대기 목록만 표시됩니다. 비밀번호와 회원 데이터는 볼 수 없습니다.
        </p>
        <p className="mt-1 text-body-sm text-text-muted">
          등록된 사용자 {data?.activeUsers ?? 0} / {data?.maxUsers ?? 200}명
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-surface">
        {pending.length === 0 ? (
          <p className="px-6 py-12 text-center text-body-sm text-on-surface-variant">
            대기 중인 가입 신청이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {pending.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-text-primary">
                    {item.nickname}
                  </p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    아이디: <span className="font-data-mono text-text-primary">{item.loginId}</span>
                  </p>
                  <p className="mt-1 text-label-caps text-text-muted">
                    신청: {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="primary"
                    disabled={actingId === item.id}
                    onClick={() => handleAction(item.id, "approve")}
                  >
                    승인
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={actingId === item.id}
                    onClick={() => handleAction(item.id, "reject")}
                  >
                    거절
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
