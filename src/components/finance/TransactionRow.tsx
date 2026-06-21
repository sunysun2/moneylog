"use client";

import { Badge, RowActionButton, RowActionGroup } from "@/components/ui";
import {
  formatManwon,
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
        {formatManwon(transaction.amountKrw)}
      </td>
      <td className="px-3 py-3 text-on-surface-variant">{formatUsd(transaction.amountUsd)}</td>
      <td className="px-3 py-3">
        <RowActionGroup>
          <RowActionButton variant="view" onClick={() => onView(transaction.id)}>
            보기
          </RowActionButton>
          <RowActionButton variant="edit" onClick={() => onEdit(transaction.id)}>
            편집
          </RowActionButton>
          <RowActionButton variant="delete" onClick={() => onDelete(transaction.id)}>
            삭제
          </RowActionButton>
        </RowActionGroup>
      </td>
    </tr>
  );
}
