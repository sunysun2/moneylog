"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SearchBar } from "@/components/layout/SearchBar";
import { useSearchStore } from "@/stores/searchStore";
import { notify } from "@/lib/notify";
import { FINANCE_TRANSACTION_UPDATED_EVENT } from "@/lib/finance-quick-actions";
import { cn } from "@/lib/cn";
import { FinanceSummary } from "./FinanceSummary";
import { FinanceMonthlyChart } from "./FinanceMonthlyChart";
import { TransactionFormModal } from "./TransactionFormModal";
import { TransactionTable } from "./TransactionTable";
import {
  emptyForm,
  formToPayload,
  PERIOD_FILTER_OPTIONS,
  getPeriodFilterButtonClassName,
  periodFilterLabel,
  transactionToForm,
  validateTransactionForm,
  type FormMode,
  type PeriodFilter,
  type TransactionData,
  type TransactionFormState,
  type TransactionStats,
  type TypeFilter,
} from "./types";
import type { TransactionType } from "@/models/Transaction";
import type { MonthlyTrendPoint } from "@/lib/transaction-service";

const EMPTY_STATS: TransactionStats = {
  totalIncome: 0,
  totalExpense: 0,
  netProfit: 0,
};

export function FinanceView() {
  const globalQuery = useSearchStore((s) => s.query);
  const setGlobalQuery = useSearchStore((s) => s.setQuery);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [stats, setStats] = useState<TransactionStats>(EMPTY_STATS);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [form, setForm] = useState<TransactionFormState>(emptyForm());
  const [modalType, setModalType] = useState<TransactionType>("income");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const typeQuery = typeFilter === "all" ? "" : `&type=${typeFilter}`;
      const [listRes, statsRes, trendsRes] = await Promise.all([
        fetch(`/api/transactions?period=${periodFilter}${typeQuery}`),
        fetch(`/api/transactions/stats?period=${periodFilter}`),
        fetch(`/api/transactions/monthly-trends?period=${periodFilter}`),
      ]);

      if (!listRes.ok || !statsRes.ok || !trendsRes.ok) throw new Error();

      const [listData, statsData, trendsData] = await Promise.all([
        listRes.json(),
        statsRes.json(),
        trendsRes.json(),
      ]);
      setTransactions(listData);
      setStats(statsData);
      setMonthlyTrends(trendsData);
    } catch {
      notify.error("장부 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [periodFilter, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    function onUpdated() {
      loadData();
    }
    window.addEventListener(FINANCE_TRANSACTION_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(FINANCE_TRANSACTION_UPDATED_EVENT, onUpdated);
  }, [loadData]);

  const filteredTransactions = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }, [transactions, globalQuery]);

  const periodLabel = periodFilterLabel(periodFilter);

  function openNewForm(type: TransactionType) {
    setActiveId(null);
    setModalType(type);
    setForm(emptyForm());
    setFormMode("new");
  }

  function openEditForm(id: string) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;
    setActiveId(id);
    setModalType(transaction.type);
    setForm(transactionToForm(transaction));
    setFormMode("edit");
  }

  function openViewForm(id: string) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;
    setActiveId(id);
    setModalType(transaction.type);
    setForm(transactionToForm(transaction));
    setFormMode("view");
  }

  function closeForm() {
    setFormMode(null);
    setActiveId(null);
    setForm(emptyForm());
  }

  async function handleSubmit() {
    const validationError = validateTransactionForm(form, modalType);
    if (validationError) {
      notify.error(validationError);
      return;
    }

    setSaving(true);
    const payload = formToPayload(modalType, form);

    try {
      const res = await fetch(
        formMode === "edit" && activeId ? `/api/transactions/${activeId}` : "/api/transactions",
        {
          method: formMode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "저장에 실패했습니다.");
      }

      notify.success(
        formMode === "edit"
          ? "거래가 수정되었습니다."
          : modalType === "income"
            ? "수입이 추가되었습니다."
            : "지출이 추가되었습니다."
      );
      closeForm();
      await loadData();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 거래를 삭제할까요?")) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify.success("거래가 삭제되었습니다.");
      if (activeId === id) closeForm();
      await loadData();
    } catch {
      notify.error("삭제에 실패했습니다.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-text-primary">수입 / 지출 관리</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            수입·지출 장부 · 기간별 통계
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="md:hidden">
            <SearchBar value={globalQuery} onChange={setGlobalQuery} />
          </div>
          <Button
            variant="ghost"
            className="font-bold text-primary"
            onClick={() => openNewForm("income")}
          >
            + 수입 추가
          </Button>
          <Button
            variant="ghost"
            className="font-bold text-warning"
            onClick={() => openNewForm("expense")}
          >
            + 지출 추가
          </Button>
        </div>
      </div>

      <FinanceSummary stats={stats} periodLabel={periodLabel} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {PERIOD_FILTER_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriodFilter(item.value)}
              className={cn(
                "rounded-lg px-4 py-2 text-body-sm font-semibold transition focus-ring-primary",
                getPeriodFilterButtonClassName(item.value, periodFilter === item.value)
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "all", label: "전체" },
              { value: "income", label: "수입" },
              { value: "expense", label: "지출" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTypeFilter(item.value)}
              className={cn(
                "rounded-lg px-4 py-2 text-body-sm font-semibold transition",
                typeFilter === item.value
                  ? "bg-primary-container text-text-primary glow-primary"
                  : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {formMode && (
        <TransactionFormModal
          open={formMode !== null}
          type={modalType}
          mode={formMode}
          form={form}
          saving={saving}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {loading ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
          불러오는 중...
        </div>
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          activeId={activeId}
          onEdit={openEditForm}
          onView={openViewForm}
          onDelete={handleDelete}
        />
      )}

      <FinanceMonthlyChart data={monthlyTrends} loading={loading} />
    </div>
  );
}
