import mongoose, { Schema, type Document, type Model } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";
import { getFieldEncryptionKey } from "@/lib/encryption";

export interface IFreelancer extends Document {
  name: string;
  phone?: string;
  kakaoId?: string;
  bank?: string;
  accountNumber?: string;
  channel?: string;
  nasId?: string;
  nasPassword?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FreelancerSchema = new Schema<IFreelancer>(
  {
    name: { type: String, required: true },
    phone: { type: String },
    kakaoId: { type: String },
    bank: { type: String },
    accountNumber: { type: String },
    channel: { type: String },
    nasId: { type: String },
    nasPassword: { type: String },
  },
  { timestamps: true }
);

FreelancerSchema.plugin(fieldEncryption, {
  fields: ["phone", "accountNumber", "nasId", "nasPassword"],
  secret: getFieldEncryptionKey(),
});

if (process.env.NODE_ENV === "development" && mongoose.models.Freelancer) {
  mongoose.deleteModel("Freelancer");
}

export const Freelancer: Model<IFreelancer> =
  mongoose.models.Freelancer ??
  mongoose.model<IFreelancer>("Freelancer", FreelancerSchema);
