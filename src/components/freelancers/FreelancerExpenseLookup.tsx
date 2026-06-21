"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { notify } from "@/lib/notify";
import { formatManwon } from "@/components/finance/types";
import {
  ALL_FREELANCERS_SELECTION,
  ALL_FREELANCERS_SELECTION_LABEL,
  FREELANCER_EXPENSE_PERIOD_OPTIONS,
  freelancerExpensePeriodLabel,
  getFreelancerExpensePeriodButtonClassName,
  type FreelancerData,
  type FreelancerExpensePeriod,
  type FreelancerExpenseResult,
} from "./types";

interface FreelancerExpenseLookupProps {
  freelancers: FreelancerData[];
}

function formatShortDate(value: string) {
  return value.slice(0, 10);
}

export function FreelancerExpenseLookup({ freelancers }: FreelancerExpenseLookupProps) {
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<FreelancerExpensePeriod | null>(null);
  const [result, setResult] = useState<FreelancerExpenseResult | null>(null);
  const [loading, setLoading] = useState(false);

  const isAllFreelancersSelected = selectedFreelancerId === ALL_FREELANCERS_SELECTION;

  async function handleLookup(period: FreelancerExpensePeriod) {
    if (!selectedFreelancerId) {
      notify.error("프리랜서를 먼저 선택해 주세요.");
      return;
    }

    setSelectedPeriod(period);
    setLoading(true);

    try {
      const url = isAllFreelancersSelected
        ? `/api/freelancers/expenses?period=${period}`
        : `/api/freelancers/${selectedFreelancerId}/expenses?period=${period}`;
      const res = await fetch(url);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "지출 내역을 불러오지 못했습니다.");
      }

      setResult(await res.json());
    } catch (err) {
      setResult(null);
      notify.error(err instanceof Error ? err.message : "지출 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <div>
        <h2 className="text-body-lg font-semibold text-text-primary">프리랜서 지출 조회</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          지출 관리에 등록된 프리랜서 비용을 기간별로 확인합니다.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-label-caps text-on-surface-variant">프리랜서 선택</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedFreelancerId(ALL_FREELANCERS_SELECTION);
              setSelectedPeriod(null);
              setResult(null);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-body-sm font-semibold transition focus-ring-primary",
              isAllFreelancersSelected
                ? "bg-red-500 text-white"
                : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {ALL_FREELANCERS_SELECTION_LABEL}
          </button>
          {freelancers.length === 0 ? (
            <p className="self-center text-body-sm text-on-surface-variant">
              등록된 프리랜서가 없습니다.
            </p>
          ) : (
            freelancers.map((freelancer) => {
              const selected = selectedFreelancerId === freelancer.id;
              return (
                <button
                  key={freelancer.id}
                  type="button"
                  onClick={() => {
                    setSelectedFreelancerId(freelancer.id);
                    setSelectedPeriod(null);
                    setResult(null);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-body-sm font-semibold transition focus-ring-primary",
                    selected
                      ? "bg-primary-container text-text-primary glow-primary"
                      : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  {freelancer.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-label-caps text-on-surface-variant">조회 기간</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FREELANCER_EXPENSE_PERIOD_OPTIONS.map((option) => {
            const selected = selectedPeriod === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={!selectedFreelancerId || loading}
                onClick={() => handleLookup(option.value)}
                className={cn(
                  "rounded-lg px-4 py-2 text-body-sm font-semibold transition focus-ring-primary disabled:cursor-not-allowed disabled:opacity-50",
                  getFreelancerExpensePeriodButtonClassName(option.value, selected)
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-body-sm text-on-surface-variant">지출 내역 불러오는 중...</p>
      )}

      {!loading && result && selectedFreelancerId && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-border-subtle bg-bg-base p-4">
            <p className="text-label-caps text-on-surface-variant">
              {result.freelancerName} · {freelancerExpensePeriodLabel(result.period)} 지출 합계
            </p>
            <p className="mt-2 text-headline-md font-semibold text-warning">
              {formatManwon(result.totalAmountKrw)}
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {result.items.length}건
            </p>
          </div>

          {result.items.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              해당 기간에 등록된 프리랜서 지출이 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border-subtle">
              <table className="w-full min-w-[480px] text-left text-body-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-label-caps text-on-surface-variant">
                    <th className="px-4 py-3 font-semibold">날짜</th>
                    <th className="px-4 py-3 font-semibold">메모</th>
                    <th className="px-4 py-3 text-right font-semibold">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.id} className="border-b border-border-subtle/60">
                      <td className="px-4 py-3 text-on-surface-variant">
                        {formatShortDate(item.date)}
                      </td>
                      <td className="px-4 py-3 text-text-primary">{item.category || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-warning">
                        {formatManwon(item.amountKrw)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
