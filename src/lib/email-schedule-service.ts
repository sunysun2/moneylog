import { connectDB } from "@/lib/db";
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

export async function getEmailSchedule(): Promise<EmailScheduleData> {
  await connectDB();
  const doc = await EmailSchedule.findOne();
  if (!doc) return DEFAULT_EMAIL_SCHEDULE;
  return toEmailScheduleData(doc);
}

export async function upsertEmailSchedule(
  input: EmailScheduleData
): Promise<EmailScheduleData> {
  await connectDB();
  const doc = await EmailSchedule.findOneAndUpdate(
    {},
    {
      enabled: input.enabled,
      recipientEmail: input.recipientEmail.trim(),
      dayOfMonth: input.dayOfMonth,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return toEmailScheduleData(doc);
}

/** 발송 성공 후에만 호출 — 이미 같은 달이면 false */
export async function markEmailSent(monthKey: string): Promise<boolean> {
  await connectDB();
  const doc = await EmailSchedule.findOneAndUpdate(
    {
      $or: [
        { lastSentMonthKey: { $exists: false } },
        { lastSentMonthKey: null },
        { lastSentMonthKey: { $ne: monthKey } },
      ],
    },
    { lastSentMonthKey: monthKey },
    { upsert: true, new: true }
  );

  return doc !== null;
}
