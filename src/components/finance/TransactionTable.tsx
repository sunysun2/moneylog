"use client";

import type { TransactionData } from "./types";
import { TransactionRow } from "./TransactionRow";

interface TransactionTableProps {
  transactions: TransactionData[];
  activeId: string | null;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({
  transactions,
  activeId,
  onEdit,
  onView,
  onDelete,
}: TransactionTableProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-body-sm">
          <thead>
            <tr className="border-b border-border-subtle text-label-caps text-on-surface-variant">
              <th className="px-3 py-3 font-semibold">날짜</th>
              <th className="px-3 py-3 font-semibold">구분</th>
              <th className="px-3 py-3 font-semibold">출처</th>
              <th className="px-3 py-3 font-semibold">카테고리</th>
              <th className="px-3 py-3 font-semibold">입력</th>
              <th className="px-3 py-3 font-semibold">KRW</th>
              <th className="px-3 py-3 font-semibold">USD</th>
              <th className="px-3 py-3 text-right font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                isActive={activeId === transaction.id}
                onEdit={onEdit}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="px-6 py-12 text-center text-body-sm text-on-surface-variant">
          등록된 거래 내역이 없습니다.
        </div>
      )}
    </div>
  );
}
