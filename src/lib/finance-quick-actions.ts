export type FinanceQuickActionType = "income" | "expense";

export const FINANCE_QUICK_ACTION_EVENT = "moneylog:finance-quick-action";
export const FINANCE_TRANSACTION_UPDATED_EVENT = "moneylog:finance-transaction-updated";

export function dispatchFinanceQuickAction(type: FinanceQuickActionType) {
  window.dispatchEvent(
    new CustomEvent(FINANCE_QUICK_ACTION_EVENT, { detail: { type } })
  );
}

export function dispatchFinanceTransactionUpdated() {
  window.dispatchEvent(new CustomEvent(FINANCE_TRANSACTION_UPDATED_EVENT));
}
