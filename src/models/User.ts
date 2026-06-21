import mongoose, { Schema, type Document, type Model } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";
import { getFieldEncryptionKey } from "@/lib/encryption";
import { hashPassword } from "@/lib/crypto";

export type UserRole = "admin" | "member";

export interface IUser extends Document {
  loginId: string;
  nickname: string;
  role: UserRole;
  passwordHash: string;
  recoveryKeyHash: string;
  isSetupComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    loginId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    nickname: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "member"], default: "member", index: true },
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

if (process.env.NODE_ENV === "development" && mongoose.models.User) {
  mongoose.deleteModel("User");
}

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export async function createAdminUser(
  loginId: string,
  nickname: string,
  password: string,
  recoveryKeyHash: string
): Promise<IUser> {
  const passwordHash = await hashPassword(password);
  return User.create({
    loginId: loginId.trim().toLowerCase(),
    nickname: nickname.trim(),
    role: "admin",
    passwordHash,
    recoveryKeyHash,
  });
}

export async function createMemberUser(
  loginId: string,
  nickname: string,
  passwordHash: string,
  recoveryKeyHash: string
): Promise<IUser> {
  return User.create({
    loginId: loginId.trim().toLowerCase(),
    nickname: nickname.trim(),
    role: "member",
    passwordHash,
    recoveryKeyHash,
  });
}
