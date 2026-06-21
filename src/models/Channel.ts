import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type ChannelStatus = "active" | "warning" | "deleted" | "inactive";
export type MonetizationType = "organic" | "purchased";
export type ContentFormat = "short" | "mid" | "long";

export interface IChannel extends Document {
  name: string;
  handle: string;
  template?: string;
  category: string;
  country: string;
  contentFormat?: ContentFormat;
  createdDate?: Date;
  hasRevenue: boolean;
  status: ChannelStatus;
  warningDates?: Date[];
  inactiveDate?: Date;
  deletedDate?: Date;
  youtubeAccount?: Types.ObjectId;
  adsenseAccount?: Types.ObjectId;
  monetizationType: MonetizationType;
  monetizationDate?: Date;
  purchaseSource?: string;
  seller?: string;
  priceUsd?: number;
  priceKrw?: number;
  purchaseDate?: Date;
  startDate?: Date;
  purchaseCountry?: string;
  purchaseCategory?: string;
  sortOrder: number;
  ownerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>(
  {
    name: { type: String, required: true },
    handle: { type: String, required: true },
    template: { type: String, default: "" },
    category: { type: String, default: "" },
    country: { type: String, default: "" },
    contentFormat: { type: String, enum: ["short", "mid", "long", null], default: null },
    createdDate: { type: Date },
    hasRevenue: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "warning", "deleted", "inactive"],
      default: "active",
    },
    warningDates: [{ type: Date }],
    inactiveDate: { type: Date },
    deletedDate: { type: Date },
    youtubeAccount: { type: Schema.Types.ObjectId, ref: "YoutubeAccount" },
    adsenseAccount: { type: Schema.Types.ObjectId, ref: "AdsenseAccount" },
    monetizationType: {
      type: String,
      enum: ["organic", "purchased"],
      default: "organic",
    },
    monetizationDate: { type: Date },
    purchaseSource: { type: String },
    seller: { type: String },
    priceUsd: { type: Number },
    priceKrw: { type: Number },
    purchaseDate: { type: Date },
    startDate: { type: Date },
    purchaseCountry: { type: String },
    purchaseCategory: { type: String },
    sortOrder: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development" && mongoose.models.Channel) {
  mongoose.deleteModel("Channel");
}

export const Channel: Model<IChannel> =
  mongoose.models.Channel ?? mongoose.model<IChannel>("Channel", ChannelSchema);
