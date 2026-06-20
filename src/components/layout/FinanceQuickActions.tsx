"use client";

import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import {
  FINANCE_QUICK_ACTION_EVENT,
  dispatchFinanceTransactionUpdated,
  type FinanceQuickActionType,
} from "@/lib/finance-quick-actions";
import { Button } from "@/components/ui/Button";
import { TransactionFormModal } from "@/components/finance/TransactionFormModal";
import {
  emptyForm,
  formToPayload,
  validateTransactionForm,
  type TransactionFormState,
} from "@/components/finance/types";

type TransactionModalType = FinanceQuickActionType | null;

export function FinanceQuickActions() {
  const [modalType, setModalType] = useState<TransactionModalType>(null);
  const [form, setForm] = useState<TransactionFormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onQuickAction(event: Event) {
      const type = (event as CustomEvent<{ type: FinanceQuickActionType }>).detail
        ?.type;
      if (type === "income" || type === "expense") {
        setForm(emptyForm());
        setModalType(type);
      }
    }

    window.addEventListener(FINANCE_QUICK_ACTION_EVENT, onQuickAction);
    return () => window.removeEventListener(FINANCE_QUICK_ACTION_EVENT, onQuickAction);
  }, []);

  function closeModal() {
    setModalType(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    if (!modalType) return;

    const validationError = validateTransactionForm(form, modalType);
    if (validationError) {
      notify.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(modalType, form)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "저장에 실패했습니다.");
      }

      notify.success(modalType === "income" ? "수입이 추가되었습니다." : "지출이 추가되었습니다.");
      closeModal();
      dispatchFinanceTransactionUpdated();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-3 px-3 py-4">
        <p className="px-1 text-center text-label-caps !text-2xl !leading-8 text-on-surface-variant">
          빠른 입력
        </p>
        <Button
          variant="ghost"
          fullWidth
          className="!w-full !justify-center !px-[22px] !py-[22px] !text-[22px] !leading-7 !font-bold text-primary"
          onClick={() => {
            setForm(emptyForm());
            setModalType("income");
          }}
        >
          + 수입 추가
        </Button>
        <Button
          variant="ghost"
          fullWidth
          className="!w-full !justify-center !px-[22px] !py-[22px] !text-[22px] !leading-7 !font-bold text-warning"
          onClick={() => {
            setForm(emptyForm());
            setModalType("expense");
          }}
        >
          + 지출 추가
        </Button>
      </div>

      {modalType && (
        <TransactionFormModal
          open={modalType !== null}
          type={modalType}
          mode="new"
          form={form}
          saving={saving}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}
    </>
  );
}
