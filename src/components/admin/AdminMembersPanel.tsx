"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { notify } from "@/lib/notify";

interface MemberItem {
  id: string;
  loginId: string;
  nickname: string;
  role: "admin" | "member";
  createdAt: string;
}

interface AdminMembersResponse {
  members: MemberItem[];
  activeUsers: number;
  maxUsers: number;
  error?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function roleLabel(role: MemberItem["role"]) {
  return role === "admin" ? "관리자" : "회원";
}

export function AdminMembersPanel() {
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [data, setData] = useState<AdminMembersResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members");
      const json = (await res.json()) as AdminMembersResponse;
      if (!res.ok) {
        notify.error(json.error ?? "회원 목록을 불러오지 못했습니다.");
        return;
      }
      setData(json);
    } catch {
      notify.error("회원 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(member: MemberItem) {
    const confirmed = window.confirm(
      `${member.nickname}(${member.loginId}) 회원을 강제 탈퇴하시겠습니까?\n저장된 모든 데이터가 삭제되며 되돌릴 수 없습니다.`
    );
    if (!confirmed) return;

    setActingId(member.id);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        notify.error(json?.error ?? "탈퇴 처리에 실패했습니다.");
        return;
      }

      notify.success("회원을 강제 탈퇴했습니다.");
      await load();
    } catch {
      notify.error("탈퇴 처리에 실패했습니다.");
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

  const members = data?.members ?? [];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-display text-primary-container">MoneyLog</h1>
        <h2 className="mt-2 text-headline-md text-text-primary">회원 탈퇴</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          가입된 회원 목록입니다. 일반 회원만 강제 탈퇴할 수 있습니다.
        </p>
        <p className="mt-1 text-body-sm text-text-muted">
          등록된 사용자 {data?.activeUsers ?? 0} / {data?.maxUsers ?? 200}명
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-surface">
        {members.length === 0 ? (
          <p className="px-6 py-12 text-center text-body-sm text-on-surface-variant">
            등록된 회원이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body-sm font-semibold text-text-primary">
                      {member.nickname}
                    </p>
                    <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-caps text-on-surface-variant">
                      {roleLabel(member.role)}
                    </span>
                  </div>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    아이디:{" "}
                    <span className="font-data-mono text-text-primary">{member.loginId}</span>
                  </p>
                  <p className="mt-1 text-label-caps text-text-muted">
                    가입: {formatDate(member.createdAt)}
                  </p>
                </div>
                {member.role === "member" ? (
                  <Button
                    variant="danger"
                    disabled={actingId === member.id}
                    onClick={() => handleRemove(member)}
                    className="shrink-0"
                  >
                    강제 탈퇴
                  </Button>
                ) : (
                  <span className="shrink-0 text-body-sm text-text-muted">탈퇴 불가</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
