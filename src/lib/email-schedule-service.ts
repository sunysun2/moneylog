import { connectDB } from "@/lib/db";
import {
  mergeOwnerFilter,
  ownerFilter,
  toOwnerObjectId,
  type OwnerContext,
} from "@/lib/owner-query";
import { EmailSchedule, type IEmailSchedule } from "@/models/EmailSchedule";

export interface EmailScheduleData {
  enabled: boolean;
  recipientEmail: string;
  dayOfMonth: number;
  lastSentMonthKey?: string;
}

export const DEFAULT_EMAIL_SCHEDULE: EmailScheduleData = {
  enabled: false,
  recipientEmail: "",
  dayOfMonth: 1,
};

function toEmailScheduleData(doc: IEmailSchedule): EmailScheduleData {
  return {
    enabled: doc.enabled,
    recipientEmail: doc.recipientEmail,
    dayOfMonth: doc.dayOfMonth,
    lastSentMonthKey: doc.lastSentMonthKey,
  };
}

export async function getEmailSchedule(ctx: OwnerContext): Promise<EmailScheduleData> {
  await connectDB();
  const doc = await EmailSchedule.findOne(ownerFilter(ctx.ownerId, ctx.isAdmin));
  if (!doc) return DEFAULT_EMAIL_SCHEDULE;
  return toEmailScheduleData(doc);
}

export async function upsertEmailSchedule(
  ctx: OwnerContext,
  input: EmailScheduleData
): Promise<EmailScheduleData> {
  await connectDB();
  const filter = ownerFilter(ctx.ownerId, ctx.isAdmin);
  const doc = await EmailSchedule.findOneAndUpdate(
    filter,
    {
      enabled: input.enabled,
      recipientEmail: input.recipientEmail.trim(),
      dayOfMonth: input.dayOfMonth,
      ownerId: toOwnerObjectId(ctx.ownerId),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return toEmailScheduleData(doc);
}

/** 발송 성공 후에만 호출 — 이미 같은 달이면 false */
export async function markEmailSent(ctx: OwnerContext, monthKey: string): Promise<boolean> {
  await connectDB();
  const doc = await EmailSchedule.findOneAndUpdate(
    mergeOwnerFilter(
      {
        $or: [
          { lastSentMonthKey: { $exists: false } },
          { lastSentMonthKey: null },
          { lastSentMonthKey: { $ne: monthKey } },
        ],
      },
      ctx.ownerId,
      ctx.isAdmin
    ),
    { lastSentMonthKey: monthKey, ownerId: toOwnerObjectId(ctx.ownerId) },
    { upsert: true, new: true }
  );

  return doc !== null;
}

/** cron: ownerId가 있는 모든 활성 스케줄 */
export async function listEnabledEmailSchedules(): Promise<
  { ctx: OwnerContext; schedule: EmailScheduleData }[]
> {
  await connectDB();
  const docs = await EmailSchedule.find({
    enabled: true,
    recipientEmail: { $ne: "" },
    ownerId: { $exists: true, $ne: null },
  });

  return docs.map((doc) => ({
    ctx: { ownerId: doc.ownerId!.toString(), isAdmin: false },
    schedule: toEmailScheduleData(doc),
  }));
}
