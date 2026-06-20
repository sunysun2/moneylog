import mongoose, { Schema, type Document, type Model } from "mongoose";

export type TransactionType = "income" | "expense";
export type TransactionSource =
  | "manual"
  | "youtube_purchase"
  | "adsense_purchase"
  | "channel_purchase";

export interface ITransaction extends Document {
  type: TransactionType;
  date: Date;
  source: TransactionSource;
  description: string;
  category?: string;
  amountKrw: number;
  amountUsd?: number;
  referenceModel?: string;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ["income", "expense"], required: true },
    date: { type: Date, required: true, default: Date.now },
    source: {
      type: String,
      enum: ["manual", "youtube_purchase", "adsense_purchase", "channel_purchase"],
      default: "manual",
    },
    description: { type: String, required: true },
    category: { type: String },
    amountKrw: { type: Number, required: true },
    amountUsd: { type: Number },
    referenceModel: { type: String },
    referenceId: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1, date: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
