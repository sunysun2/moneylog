"use client";

import { Badge } from "@/components/ui";
import {
  formatKrw,
  formatUsd,
  sourceLabel,
  type TransactionData,
} from "./types";

interface TransactionRowProps {
  transaction: TransactionData;
  isActive: boolean;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

export function TransactionRow({
  transaction,
  isActive,
  onEdit,
  onView,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.type === "income";

  return (
    <tr
      className={
        isActive ? "border-b border-border-subtle/60 bg-primary/5" : "border-b border-border-subtle/60"
      }
    >
      <td className="px-3 py-3 text-on-surface-variant">{formatDate(transaction.date)}</td>
      <td className="px-3 py-3">
        {isIncome ? (
          <Badge variant="success">수입</Badge>
        ) : (
          <Badge variant="warning">지출</Badge>
        )}
      </td>
      <td className="px-3 py-3 font-medium text-text-primary">{transaction.description}</td>
      <td className="px-3 py-3 text-on-surface-variant">{transaction.category || "—"}</td>
      <td className="px-3 py-3">
        <Badge variant={transaction.source === "manual" ? "muted" : "default"}>
          {sourceLabel(transaction.source)}
        </Badge>
      </td>
      <td
        className={`px-3 py-3 font-medium ${isIncome ? "text-primary-container" : "text-warning"}`}
      >
        {isIncome ? "+" : "-"}
        {formatKrw(transaction.amountKrw)}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">{formatUsd(transaction.amountUsd)}</td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onView(transaction.id)}
            className="rounded-lg px-2.5 py-1.5 text-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-info"
          >
            보기
          </button>
          <button
            type="button"
            onClick={() => onEdit(transaction.id)}
            className="rounded-lg px-2.5 py-1.5 text-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction.id)}
            className="rounded-lg px-2.5 py-1.5 text-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-red-400"
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}
