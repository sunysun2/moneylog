"use client";

import { cn } from "@/lib/cn";
import type { TransactionStats } from "./types";
import { formatManwon } from "./types";

interface FinanceSummaryProps {
  stats: TransactionStats;
  periodLabel: string;
}

export function FinanceSummary({ stats, periodLabel }: FinanceSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
        <p className="text-label-caps text-on-surface-variant">{periodLabel} 수입</p>
        <p className="mt-2 text-headline-md font-semibold text-primary-container">
          {formatManwon(stats.totalIncome)}
        </p>
      </div>
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
        <p className="text-label-caps text-on-surface-variant">{periodLabel} 지출</p>
        <p className="mt-2 text-headline-md font-semibold text-warning">
          {formatManwon(stats.totalExpense)}
        </p>
      </div>
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
        <p className="text-label-caps text-on-surface-variant">{periodLabel} 순이익</p>
        <p
          className={cn(
            "mt-2 text-headline-md font-semibold",
            stats.netProfit >= 0 ? "text-primary-container" : "text-red-400"
          )}
        >
          {formatManwon(stats.netProfit)}
        </p>
      </div>
    </div>
  );
}
