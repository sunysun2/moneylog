import { connectDB } from "@/lib/db";
import {
  Transaction,
  type ITransaction,
  type TransactionSource,
  type TransactionType,
} from "@/models/Transaction";

export interface TransactionData {
  id: string;
  type: TransactionType;
  date: string;
  source: TransactionSource;
  description: string;
  category?: string;
  amountKrw: number;
  amountUsd?: number;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
}

export interface TransactionFilters {
  type?: TransactionType;
  month?: string;
  period?: TransactionPeriod;
}

export type TransactionPeriod = "all" | "month" | "3m" | "1y";

function serializeTransaction(doc: ITransaction): TransactionData {
  return {
    id: doc._id.toString(),
    type: doc.type,
    date: doc.date.toISOString(),
    source: doc.source,
    description: doc.description,
    category: doc.category,
    amountKrw: doc.amountKrw,
    amountUsd: doc.amountUsd,
  };
}

function buildDateRange(month?: string) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return null;

  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);
  return { start, end };
}

function buildDateFilter(period?: TransactionPeriod) {
  if (!period || period === "all") return null;

  const now = new Date();

  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  if (period === "3m") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

function buildQuery(filters?: TransactionFilters) {
  const query: Record<string, unknown> = {};
  if (filters?.type) query.type = filters.type;

  const range = buildDateFilter(filters?.period) ?? buildDateRange(filters?.month);
  if (range) {
    query.date = { $gte: range.start, $lt: range.end };
  }

  return query;
}

export async function listTransactions(
  filters?: TransactionFilters
): Promise<TransactionData[]> {
  await connectDB();
  const docs = await Transaction.find(buildQuery(filters)).sort({ date: -1, createdAt: -1 });
  return docs.map(serializeTransaction);
}

export async function getTransactionStats(
  filters?: Omit<TransactionFilters, "type">
): Promise<TransactionStats> {
  await connectDB();
  const query = buildQuery(filters);
  const docs = await Transaction.find(query);

  let totalIncome = 0;
  let totalExpense = 0;

  for (const doc of docs) {
    if (doc.type === "income") totalIncome += doc.amountKrw;
    else totalExpense += doc.amountKrw;
  }

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
  };
}

function formatMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${year.slice(-2)}.${month}`;
}

function listMonthKeysForPeriod(period: TransactionPeriod): string[] {
  const now = new Date();
  const keys: string[] = [];

  if (period === "month") {
    keys.push(formatMonthKey(now));
    return keys;
  }

  const count = period === "3m" ? 3 : 12;
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    keys.push(formatMonthKey(date));
  }

  return keys;
}

export async function getMonthlyTrends(period: TransactionPeriod): Promise<MonthlyTrendPoint[]> {
  await connectDB();
  const query = buildQuery({ period });
  const docs = await Transaction.find(query);

  const totals = new Map<string, { income: number; expense: number }>();

  for (const doc of docs) {
    const key = formatMonthKey(doc.date);
    const entry = totals.get(key) ?? { income: 0, expense: 0 };
    if (doc.type === "income") entry.income += doc.amountKrw;
    else entry.expense += doc.amountKrw;
    totals.set(key, entry);
  }

  let monthKeys = listMonthKeysForPeriod(period);

  if (period === "all") {
    monthKeys = [...totals.keys()].sort();
    if (monthKeys.length === 0) {
      monthKeys = listMonthKeysForPeriod("1y");
    }
  }

  return monthKeys.map((month) => {
    const entry = totals.get(month) ?? { income: 0, expense: 0 };
    return {
      month,
      label: formatMonthLabel(month),
      income: entry.income,
      expense: entry.expense,
    };
  });
}

export async function createTransaction(
  data: Record<string, unknown>
): Promise<TransactionData> {
  await connectDB();
  const doc = await Transaction.create({ ...data, source: data.source ?? "manual" });
  return serializeTransaction(doc);
}

export async function updateTransaction(
  id: string,
  data: Record<string, unknown>
): Promise<TransactionData | null> {
  await connectDB();
  const doc = await Transaction.findById(id);
  if (!doc) return null;

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    (doc as unknown as Record<string, unknown>)[key] = value;
  }

  await doc.save();
  return serializeTransaction(doc);
}

export async function deleteTransaction(id: string): Promise<boolean> {
  await connectDB();
  const result = await Transaction.findByIdAndDelete(id);
  return Boolean(result);
}

export function sanitizeTransactionPayload(
  data: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };

  if ("date" in out && out.date) {
    const date = new Date(String(out.date));
    if (!Number.isNaN(date.getTime())) out.date = date;
    else delete out.date;
  }

  if ("amountKrw" in out) {
    const krw = Number(out.amountKrw);
    if (Number.isNaN(krw)) delete out.amountKrw;
    else out.amountKrw = krw;
  }

  if ("amountUsd" in out) {
    if (out.amountUsd === null || out.amountUsd === "") {
      out.amountUsd = null;
    } else {
      const usd = Number(out.amountUsd);
      if (Number.isNaN(usd)) delete out.amountUsd;
      else out.amountUsd = usd;
    }
  }

  return out;
}
