"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { notify } from "@/lib/notify";

interface EmailScheduleResponse {
  enabled: boolean;
  recipientEmail: string;
  dayOfMonth: number;
  lastSentMonthKey?: string;
  smtpConfigured: boolean;
  cronConfigured: boolean;
}

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1;
  return { value: String(day), label: `매월 ${day}일` };
});

export function EmailScheduleView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [lastSentMonthKey, setLastSentMonthKey] = useState<string>();
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [cronConfigured, setCronConfigured] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/email-schedule");
      if (!response.ok) throw new Error();

      const data = (await response.json()) as EmailScheduleResponse;
      setEnabled(data.enabled);
      setRecipientEmail(data.recipientEmail);
      setDayOfMonth(String(data.dayOfMonth));
      setLastSentMonthKey(data.lastSentMonthKey);
      setSmtpConfigured(data.smtpConfigured);
      setCronConfigured(data.cronConfigured);
    } catch {
      notify.error("이메일 설정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const statusMessage = useMemo(() => {
    if (!smtpConfigured) return "SMTP 환경 변수를 Cloudtype에 설정해야 메일을 보낼 수 있습니다.";
    if (!cronConfigured) return "CRON_SECRET을 설정하고 외부 스케줄러에서 매일 cron API를 호출해야 자동 발송됩니다.";
    if (enabled) {
      return "설정일 이후 매일 발송을 시도합니다. SMTP 오류 시에도 해당 월 말까지 재시도합니다.";
    }
    return "자동 발송이 꺼져 있습니다.";
  }, [cronConfigured, enabled, smtpConfigured]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/email-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          recipientEmail,
          dayOfMonth: Number(dayOfMonth),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | (EmailScheduleResponse & { error?: string })
        | null;

      if (!response.ok) {
        notify.error(data?.error ?? "설정 저장에 실패했습니다.");
        return;
      }

      setSmtpConfigured(Boolean(data?.smtpConfigured));
      setCronConfigured(Boolean(data?.cronConfigured));
      notify.success("이메일 설정을 저장했습니다.");
    } catch {
      notify.error("설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestSend() {
    setTesting(true);
    try {
      const response = await fetch("/api/email-schedule/test", { method: "POST" });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; monthKey?: string }
        | null;

      if (!response.ok) {
        notify.error(data?.error ?? "테스트 메일 발송에 실패했습니다.");
        return;
      }

      notify.success("테스트 메일을 발송했습니다.");
      await loadSettings();
    } catch {
      notify.error("테스트 메일 발송에 실패했습니다.");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
        설정 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-headline-md text-text-primary">이메일 리포트</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          매월 지정한 날짜에 당월 통합 리포트를 이메일로 받습니다.
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body-sm font-semibold text-text-primary">자동 발송</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">{statusMessage}</p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span className="text-body-sm text-text-primary">사용</span>
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            label="수신 이메일"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="example@gmail.com"
          />
          <Select
            label="발송일"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            options={DAY_OPTIONS}
          />
        </div>

        {lastSentMonthKey && (
          <p className="mt-4 text-body-sm text-on-surface-variant">
            마지막 발송 월: {lastSentMonthKey}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "설정 저장"}
          </Button>
          <Button variant="secondary" onClick={handleTestSend} disabled={testing}>
            {testing ? "발송 중..." : "테스트 메일 보내기"}
          </Button>
        </div>
        <p className="mt-3 text-body-sm text-on-surface-variant">
          테스트 메일은 저장된 수신 이메일로 발송됩니다. 입력 후 반드시 설정 저장을 먼저 해 주세요.
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 text-body-sm text-on-surface-variant">
        <h2 className="text-body-lg font-semibold text-text-primary">Cloudtype 설정 안내</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Cloudtype 환경 변수에 SMTP 설정과 CRON_SECRET을 추가합니다.</li>
          <li>
            cron-job.org 등 외부 스케줄러에서 매일 1회{" "}
            <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-text-primary">
              /api/cron/monthly-email
            </code>{" "}
            을 호출합니다.
          </li>
          <li>
            요청 헤더에{" "}
            <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-text-primary">
              Authorization: Bearer CRON_SECRET
            </code>{" "}
            또는{" "}
            <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-text-primary">
              x-cron-secret: CRON_SECRET
            </code>
            을 넣습니다. URL 쿼리로 secret을 넣지 마세요.
          </li>
          <li>한국 시간 기준 매일 오전 9시 호출을 권장합니다. (UTC 00:00)</li>
        </ol>
      </div>
    </div>
  );
}
