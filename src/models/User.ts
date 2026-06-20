import mongoose, { Schema, type Document, type Model } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";
import { getFieldEncryptionKey } from "@/lib/encryption";
import { hashPassword } from "@/lib/crypto";

export interface IUser extends Document {
  passwordHash: string;
  recoveryKeyHash: string;
  isSetupComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    passwordHash: { type: String, required: true },
    recoveryKeyHash: { type: String, required: true },
    isSetupComplete: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.plugin(fieldEncryption, {
  fields: ["recoveryKeyHash"],
  secret: getFieldEncryptionKey(),
});

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export async function createAdminUser(
  password: string,
  recoveryKeyHash: string
): Promise<IUser> {
  const passwordHash = await hashPassword(password);
  return User.create({ passwordHash, recoveryKeyHash });
}
