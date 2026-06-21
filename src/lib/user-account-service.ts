import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { normalizeLoginId } from "@/lib/validate-auth-fields";
import { User, type UserRole } from "@/models/User";
import { SignupRequest } from "@/models/SignupRequest";
import {
  AdsenseAccount,
  Channel,
  ChannelPreference,
  EmailSchedule,
  Freelancer,
  PhoneDevice,
  Transaction,
  YoutubeAccount,
} from "@/models";

async function deleteUserData(ownerId: string): Promise<void> {
  const oid = new Types.ObjectId(ownerId);
  await YoutubeAccount.deleteMany({ ownerId: oid });
  await AdsenseAccount.deleteMany({ ownerId: oid });
  await PhoneDevice.deleteMany({ ownerId: oid });
  await Channel.deleteMany({ ownerId: oid });
  await Freelancer.deleteMany({ ownerId: oid });
  await ChannelPreference.deleteMany({ ownerId: oid });
  await Transaction.deleteMany({ ownerId: oid });
  await EmailSchedule.deleteMany({ ownerId: oid });
}

export interface MemberSummary {
  id: string;
  loginId: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
}

export async function listMembers(): Promise<MemberSummary[]> {
  await connectDB();
  const docs = await User.find()
    .select("loginId nickname role createdAt")
    .sort({ createdAt: 1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    loginId: doc.loginId,
    nickname: doc.nickname,
    role: doc.role,
    createdAt: doc.createdAt.toISOString(),
  }));
}

export async function removeUserAccount(userId: string): Promise<void> {
  await connectDB();
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role === "admin") {
    throw new Error("CANNOT_REMOVE_ADMIN");
  }

  await deleteUserData(userId);
  await SignupRequest.deleteMany({ loginId: user.loginId });
  await User.findByIdAndDelete(userId);
}

export async function withdrawByCredentials(
  loginId: string,
  password: string
): Promise<void> {
  await connectDB();
  const normalized = normalizeLoginId(loginId);
  const user = await User.findOne({ loginId: normalized });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.role === "admin") {
    throw new Error("ADMIN_CANNOT_WITHDRAW");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await removeUserAccount(user._id.toString());
}
