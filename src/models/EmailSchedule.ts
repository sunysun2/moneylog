import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IEmailSchedule extends Document {
  enabled: boolean;
  recipientEmail: string;
  dayOfMonth: number;
  lastSentMonthKey?: string;
  ownerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailScheduleSchema = new Schema<IEmailSchedule>(
  {
    enabled: { type: Boolean, default: false },
    recipientEmail: { type: String, default: "" },
    dayOfMonth: { type: Number, default: 1, min: 1, max: 31 },
    lastSentMonthKey: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

export const EmailSchedule: Model<IEmailSchedule> =
  mongoose.models.EmailSchedule ??
  mongoose.model<IEmailSchedule>("EmailSchedule", EmailScheduleSchema);
