import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";
import { getFieldEncryptionKey } from "@/lib/encryption";
import { hashForSearch } from "@/lib/hash";
import { OtpSchema } from "./shared/Otp";

export type AccountStatus = "active" | "warning" | "deleted" | "inactive" | "pending";

export interface IAdsenseAccount extends Document {
  accountId: string;
  accountIdHash: string;
  password: string;
  holderName?: string;
  youtubeAccount?: string;
  channelName?: string;
  bank?: string;
  accountNumber?: string;
  phone?: string;
  address?: string;
  appliedDate?: Date;
  arrivedDate?: Date;
  status: AccountStatus;
  otpInUse: boolean;
  otps: { label: string; secret: string; notes: string }[];
  linkedYoutubeAccount?: Types.ObjectId;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdsenseAccountSchema = new Schema<IAdsenseAccount>(
  {
    accountId: { type: String, required: true },
    accountIdHash: { type: String, required: true, index: true },
    password: { type: String, required: true },
    holderName: { type: String },
    youtubeAccount: { type: String },
    channelName: { type: String },
    bank: { type: String },
    accountNumber: { type: String },
    phone: { type: String },
    address: { type: String },
    appliedDate: { type: Date },
    arrivedDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "warning", "deleted", "inactive", "pending"],
      default: "pending",
    },
    otpInUse: { type: Boolean, default: true },
    otps: { type: [OtpSchema], default: [] },
    linkedYoutubeAccount: {
      type: Schema.Types.ObjectId,
      ref: "YoutubeAccount",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AdsenseAccountSchema.pre("save", function (next) {
  if (this.isModified("accountId")) {
    this.accountIdHash = hashForSearch(this.accountId);
  }
  next();
});

AdsenseAccountSchema.plugin(fieldEncryption, {
  fields: ["password", "accountNumber", "phone", "address", "otps"],
  secret: getFieldEncryptionKey(),
});

export const AdsenseAccount: Model<IAdsenseAccount> =
  mongoose.models.AdsenseAccount ??
  mongoose.model<IAdsenseAccount>("AdsenseAccount", AdsenseAccountSchema);
