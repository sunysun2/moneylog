import { connectDB } from "@/lib/db";
import {
  FREELANCER_EXPENSE_REASON,
  formatFreelancerMemo,
  parseFreelancerNameFromMemo,
} from "@/components/finance/types";
import {
  mergeOwnerFilter,
  ownerFilter,
  toOwnerObjectId,
  type OwnerContext,
} from "@/lib/owner-query";
import { Freelancer, type IFreelancer } from "@/models/Freelancer";
import { Transaction, type ITransaction } from "@/models/Transaction";
import type {
  FreelancerData,
  FreelancerExpensePeriod,
  FreelancerExpenseResult,
} from "@/components/freelancers/types";

function serializeFreelancer(doc: IFreelancer): FreelancerData {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    kakaoId: doc.kakaoId,
    bank: doc.bank,
    accountNumber: doc.accountNumber,
    channel: doc.channel,
    nasId: doc.nasId,
    nasPassword: doc.nasPassword,
  };
}

function applyPayload(doc: IFreelancer, data: Record<string, unknown>) {
  const fields = [
    "name",
    "phone",
    "kakaoId",
    "bank",
    "accountNumber",
    "channel",
    "nasId",
    "nasPassword",
  ] as const;

  for (const field of fields) {
    if (field in data) {
      doc.set(field, data[field]);
    }
  }
}

export function resolveUniqueFreelancerName(
  requestedName: string,
  existingNames: Set<string>
): string {
  const baseName = requestedName.trim();
  if (!baseName) return baseName;

  if (!existingNames.has(baseName)) {
    return baseName;
  }

  for (let index = 0; index < 26; index += 1) {
    const candidate = `${baseName}${String.fromCharCode(65 + index)}`;
    if (!existingNames.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("사용 가능한 프리랜서 이름을 만들 수 없습니다.");
}

async function loadExistingFreelancerNames(
  ctx: OwnerContext,
  excludeId?: string
): Promise<Set<string>> {
  const query = mergeOwnerFilter(
    excludeId ? { _id: { $ne: excludeId } } : {},
    ctx.ownerId,
    ctx.isAdmin
  );
  const docs = await Freelancer.find(query).select("name");
  return new Set(docs.map((doc) => doc.name));
}

export async function listFreelancers(ctx: OwnerContext): Promise<FreelancerData[]> {
  await connectDB();
  const docs = await Freelancer.find(ownerFilter(ctx.ownerId, ctx.isAdmin)).sort({
    name: 1,
    createdAt: 1,
  });
  return docs.map(serializeFreelancer);
}

export async function createFreelancer(
  ctx: OwnerContext,
  data: Record<string, unknown>
): Promise<FreelancerData> {
  await connectDB();
  const requestedName = String(data.name ?? "").trim();
  const existingNames = await loadExistingFreelancerNames(ctx);
  const uniqueName = resolveUniqueFreelancerName(requestedName, existingNames);

  const doc = new Freelancer();
  applyPayload(doc, { ...data, name: uniqueName });
  doc.ownerId = toOwnerObjectId(ctx.ownerId);
  await doc.save();
  return serializeFreelancer(doc);
}

export async function updateFreelancer(
  ctx: OwnerContext,
  id: string,
  data: Record<string, unknown>
): Promise<FreelancerData | null> {
  await connectDB();
  const doc = await Freelancer.findOne(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin)
  );
  if (!doc) return null;

  const payload = { ...data };

  if (payload.name != null) {
    const requestedName = String(payload.name).trim();
    const existingNames = await loadExistingFreelancerNames(ctx, id);
    payload.name = resolveUniqueFreelancerName(requestedName, existingNames);
  }

  applyPayload(doc, payload);
  await doc.save();
  return serializeFreelancer(doc);
}

export async function deleteFreelancer(ctx: OwnerContext, id: string): Promise<boolean> {
  await connectDB();
  const result = await Freelancer.findOneAndDelete(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin)
  );
  return Boolean(result);
}

function buildFreelancerExpenseDateFilter(period: FreelancerExpensePeriod) {
  if (period === "all") return null;

  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start, end };
  }

  if (period === "1w") {
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { start, end };
  }

  if (period === "month") {
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    return { start, end };
  }

  if (period === "3m") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { start, end };
  }

  return null;
}

function serializeFreelancerExpense(doc: ITransaction) {
  return {
    id: doc._id.toString(),
    date: doc.date.toISOString(),
    amountKrw: doc.amountKrw,
    category: doc.category,
  };
}

function getFreelancerNameFromExpense(doc: ITransaction): string | null {
  if (doc.type !== "expense" || doc.description !== FREELANCER_EXPENSE_REASON) {
    return null;
  }

  const memo = doc.category?.trim();
  if (!memo) return null;

  return parseFreelancerNameFromMemo(memo);
}

function matchesFreelancerExpense(doc: ITransaction, freelancerName: string) {
  const name = getFreelancerNameFromExpense(doc);
  if (!name) return false;

  if (name === freelancerName) return true;

  return doc.category?.trim() === formatFreelancerMemo(freelancerName);
}

function matchesRegisteredFreelancerExpense(
  doc: ITransaction,
  registeredNames: Set<string>
) {
  const name = getFreelancerNameFromExpense(doc);
  return Boolean(name && registeredNames.has(name));
}

function listFreelancerExpenseItems(
  docs: ITransaction[],
  filter: (doc: ITransaction) => boolean
) {
  return docs.filter(filter).map(serializeFreelancerExpense);
}

export async function listFreelancerExpenses(
  ctx: OwnerContext,
  id: string,
  period: FreelancerExpensePeriod
): Promise<FreelancerExpenseResult | null> {
  await connectDB();
  const freelancer = await Freelancer.findOne(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin)
  );
  if (!freelancer) return null;

  const query: Record<string, unknown> = {
    type: "expense",
    description: FREELANCER_EXPENSE_REASON,
  };

  const range = buildFreelancerExpenseDateFilter(period);
  if (range) {
    query.date = { $gte: range.start, $lt: range.end };
  }

  const docs = await Transaction.find(
    mergeOwnerFilter(query, ctx.ownerId, ctx.isAdmin)
  ).sort({ date: -1, createdAt: -1 });
  const items = listFreelancerExpenseItems(docs, (doc) =>
    matchesFreelancerExpense(doc, freelancer.name)
  );

  const totalAmountKrw = items.reduce((sum, item) => sum + item.amountKrw, 0);

  return {
    freelancerId: freelancer._id.toString(),
    freelancerName: freelancer.name,
    period,
    totalAmountKrw,
    items,
  };
}

export async function listAllFreelancerExpenses(
  ctx: OwnerContext,
  period: FreelancerExpensePeriod
): Promise<FreelancerExpenseResult> {
  await connectDB();
  const freelancers = await Freelancer.find(ownerFilter(ctx.ownerId, ctx.isAdmin)).sort({
    name: 1,
    createdAt: 1,
  });
  const registeredNames = new Set(freelancers.map((doc) => doc.name));

  const query: Record<string, unknown> = {
    type: "expense",
    description: FREELANCER_EXPENSE_REASON,
  };

  const range = buildFreelancerExpenseDateFilter(period);
  if (range) {
    query.date = { $gte: range.start, $lt: range.end };
  }

  const docs = await Transaction.find(
    mergeOwnerFilter(query, ctx.ownerId, ctx.isAdmin)
  ).sort({ date: -1, createdAt: -1 });
  const items = listFreelancerExpenseItems(docs, (doc) =>
    matchesRegisteredFreelancerExpense(doc, registeredNames)
  );

  const totalAmountKrw = items.reduce((sum, item) => sum + item.amountKrw, 0);

  return {
    freelancerId: "all",
    freelancerName: "전체",
    period,
    totalAmountKrw,
    items,
  };
}
