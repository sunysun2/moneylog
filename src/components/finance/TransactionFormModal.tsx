"use client";

import { useEffect, useMemo, useState } from "react";
import { formatKoreanShortDateInput } from "@/lib/korean-short-date-format";
import { Input, Select } from "@/components/ui";
import { Modal, ModalActions } from "@/components/ui/Modal";
import type { TransactionType } from "@/models/Transaction";
import {
  EXPENSE_REASON_OPTIONS,
  formatFreelancerMemo,
  formatManwonInput,
  isFreelancerExpenseReason,
  parseFreelancerNameFromMemo,
  type FormMode,
  type TransactionFormState,
} from "./types";

interface TransactionFormModalProps {
  open: boolean;
  type: TransactionType;
  mode: FormMode;
  form: TransactionFormState;
  saving: boolean;
  onChange: (patch: Partial<TransactionFormState>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function TransactionFormModal({
  open,
  type,
  mode,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const readOnly = mode === "view";
  const fieldProps = readOnly ? { disabled: true, readOnly: true } : {};
  const isExpense = type === "expense";
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const [freelancerNames, setFreelancerNames] = useState<string[]>([]);
  const isFreelancerExpense = isExpense && isFreelancerExpenseReason(form.description);

  useEffect(() => {
    if (!open || isExpense) return;

    let cancelled = false;

    fetch("/api/channels")
      .then((res) => (res.ok ? res.json() : []))
      .then((channels: { name: string }[]) => {
        if (cancelled) return;
        const names = [
          ...new Set(channels.map((channel) => channel.name.trim()).filter(Boolean)),
        ].sort((a, b) => a.localeCompare(b, "ko"));
        setChannelNames(names);
      })
      .catch(() => {
        if (!cancelled) setChannelNames([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open, isExpense]);

  useEffect(() => {
    if (!open || !isFreelancerExpense) return;

    let cancelled = false;

    fetch("/api/freelancers")
      .then((res) => (res.ok ? res.json() : []))
      .then((freelancers: { name: string }[]) => {
        if (cancelled) return;
        const names = [
          ...new Set(freelancers.map((freelancer) => freelancer.name.trim()).filter(Boolean)),
        ].sort((a, b) => a.localeCompare(b, "ko"));
        setFreelancerNames(names);
      })
      .catch(() => {
        if (!cancelled) setFreelancerNames([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open, isFreelancerExpense]);

  const channelOptions = useMemo(() => {
    const options = [{ value: "", label: "채널 선택" }];
    for (const name of channelNames) {
      options.push({ value: name, label: name });
    }
    if (form.description && !channelNames.includes(form.description)) {
      options.push({ value: form.description, label: form.description });
    }
    return options;
  }, [channelNames, form.description]);

  const expenseReasonOptions = useMemo(() => {
    const options = [{ value: "", label: "지출 사유 선택" }];
    for (const reason of EXPENSE_REASON_OPTIONS) {
      options.push({ value: reason, label: reason });
    }
    if (form.description && !(EXPENSE_REASON_OPTIONS as readonly string[]).includes(form.description)) {
      options.push({ value: form.description, label: form.description });
    }
    return options;
  }, [form.description]);

  const freelancerMemoOptions = useMemo(() => {
    const options = [{ value: "", label: "프리랜서 선택" }];
    for (const name of freelancerNames) {
      options.push({ value: name, label: formatFreelancerMemo(name) });
    }
    const selectedName = parseFreelancerNameFromMemo(form.category);
    if (selectedName && !freelancerNames.includes(selectedName)) {
      options.push({ value: selectedName, label: form.category });
    }
    return options;
  }, [freelancerNames, form.category]);

  const title =
    mode === "new"
      ? type === "income"
        ? "수입 추가"
        : "지출 추가"
      : mode === "edit"
        ? type === "income"
          ? "수입 수정"
          : "지출 수정"
        : type === "income"
          ? "수입 보기"
          : "지출 보기";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        readOnly ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
          >
            닫기
          </button>
        ) : (
          <ModalActions
            onCancel={onClose}
            onConfirm={onSubmit}
            confirmLabel={mode === "new" ? "추가" : "저장"}
            loading={saving}
          />
        )
      }
    >
      <div className="space-y-4">
        <Input
          label="날짜"
          value={form.date}
          onChange={(e) => onChange({ date: formatKoreanShortDateInput(e.target.value) })}
          placeholder="25년. 06월. 19일"
          inputMode="numeric"
          {...fieldProps}
        />
        {isExpense ? (
          <Select
            label="지출 사유"
            value={form.description}
            onChange={(e) => {
              const nextReason = e.target.value;
              const patch: Partial<TransactionFormState> = { description: nextReason };

              if (isFreelancerExpenseReason(nextReason)) {
                if (!parseFreelancerNameFromMemo(form.category)) {
                  patch.category = "";
                }
              } else if (parseFreelancerNameFromMemo(form.category)) {
                patch.category = "";
              }

              onChange(patch);
            }}
            options={expenseReasonOptions}
            disabled={readOnly}
          />
        ) : (
          <Select
            label="채널명"
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            options={channelOptions}
            disabled={readOnly}
          />
        )}
        <Input
          label="KRW (만원)"
          value={form.amountKrw}
          onChange={(e) => onChange({ amountKrw: formatManwonInput(e.target.value) })}
          placeholder="0"
          inputMode="numeric"
          {...fieldProps}
        />
        {isFreelancerExpense ? (
          readOnly ? (
            <Input
              label="메모"
              value={form.category}
              readOnly
              disabled
            />
          ) : (
            <Select
              label="메모"
              value={parseFreelancerNameFromMemo(form.category) ?? ""}
              onChange={(e) =>
                onChange({
                  category: e.target.value ? formatFreelancerMemo(e.target.value) : "",
                })
              }
              options={freelancerMemoOptions}
            />
          )
        ) : (
          <Input
            label={isExpense ? "메모" : "채널 정보"}
            value={form.category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder={isExpense ? "메모" : "채널 정보"}
            {...fieldProps}
          />
        )}
      </div>
    </Modal>
  );
}
