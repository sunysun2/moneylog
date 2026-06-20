import mongoose, { Schema, type Document, type Model } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";
import { getFieldEncryptionKey } from "@/lib/encryption";

export interface IPhoneDevice extends Document {
  devicePhone: string;
  phoneModel?: string;
  mobileCarrier?: string;
  mvnoProvider?: string;
  mobilePlan?: string;
  ratePlan?: string;
  purchaseSource?: string;
  priceKrw?: number;
  purchaseDate?: Date;
  bank?: string;
  accountNumber?: string;
  paymentDay?: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PhoneDeviceSchema = new Schema<IPhoneDevice>(
  {
    devicePhone: { type: String, required: true },
    phoneModel: { type: String },
    mobileCarrier: { type: String },
    mvnoProvider: { type: String },
    mobilePlan: { type: String },
    ratePlan: { type: String },
    purchaseSource: { type: String },
    priceKrw: { type: Number },
    purchaseDate: { type: Date },
    bank: { type: String },
    accountNumber: { type: String },
    paymentDay: { type: Number, min: 1, max: 31 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PhoneDeviceSchema.plugin(fieldEncryption, {
  fields: ["devicePhone", "accountNumber"],
  secret: getFieldEncryptionKey(),
});

if (process.env.NODE_ENV === "development" && mongoose.models.PhoneDevice) {
  mongoose.deleteModel("PhoneDevice");
}

export const PhoneDevice: Model<IPhoneDevice> =
  mongoose.models.PhoneDevice ??
  mongoose.model<IPhoneDevice>("PhoneDevice", PhoneDeviceSchema);
