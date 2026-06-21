import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";
import { getFieldEncryptionKey } from "@/lib/encryption";
import { hashForSearch } from "@/lib/hash";
import { OtpSchema } from "./shared/Otp";

export type AccountOrigin = "created" | "purchased";
export type AccountStatus = "active" | "warning" | "deleted" | "inactive";
export type AdsenseLinkStatus = "linked" | "unlinked" | "pending";

export interface IYoutubeAccount extends Document {
  accountId: string;
  accountIdHash: string;
  password: string;
  adsenseAccount?: string;
  phone?: string;
  origin: AccountOrigin;
  isInUse: boolean;
  apiKey?: string;
  adsenseStatus: AdsenseLinkStatus;
  otpInUse: boolean;
  otps: { label: string; secret: string; notes: string }[];
  createdDate?: Date;
  purchaseSource?: string;
  seller?: string;
  priceUsd?: number;
  priceKrw?: number;
  purchaseDate?: Date;
  accountCreatedDate?: Date;
  status: AccountStatus;
  sortOrder: number;
  ownerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const YoutubeAccountSchema = new Schema<IYoutubeAccount>(
  {
    accountId: { type: String, required: true },
    accountIdHash: { type: String, required: true, index: true },
    password: { type: String, required: true },
    adsenseAccount: { type: String },
    phone: { type: String },
    origin: { type: String, enum: ["created", "purchased"], required: true },
    isInUse: { type: Boolean, default: true },
    apiKey: { type: String },
    adsenseStatus: {
      type: String,
      enum: ["linked", "unlinked", "pending"],
      default: "unlinked",
    },
    otpInUse: { type: Boolean, default: true },
    otps: { type: [OtpSchema], default: [] },
    createdDate: { type: Date },
    purchaseSource: { type: String },
    seller: { type: String },
    priceUsd: { type: Number },
    priceKrw: { type: Number },
    purchaseDate: { type: Date },
    accountCreatedDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "warning", "deleted", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

YoutubeAccountSchema.pre("save", function (next) {
  if (this.isModified("accountId")) {
    this.accountIdHash = hashForSearch(this.accountId);
  }
  next();
});

YoutubeAccountSchema.plugin(fieldEncryption, {
  fields: ["password", "apiKey", "phone", "otps"],
  secret: getFieldEncryptionKey(),
});

export const YoutubeAccount: Model<IYoutubeAccount> =
  mongoose.models.YoutubeAccount ??
  mongoose.model<IYoutubeAccount>("YoutubeAccount", YoutubeAccountSchema);
