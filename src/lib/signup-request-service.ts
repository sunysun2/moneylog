import { connectDB } from "@/lib/db";
import {
  generateRecoveryKey,
  hashPassword,
  hashRecoveryKey,
} from "@/lib/crypto";
import { MAX_APP_USERS } from "@/lib/auth-constants";
import { createMemberUser } from "@/models/User";
import { SignupRequest, type ISignupRequest } from "@/models/SignupRequest";
import { User } from "@/models/User";

export interface SignupRequestSummary {
  id: string;
  loginId: string;
  nickname: string;
  status: ISignupRequest["status"];
  createdAt: string;
  reviewedAt?: string;
}

function toSummary(doc: ISignupRequest): SignupRequestSummary {
  return {
    id: doc._id.toString(),
    loginId: doc.loginId,
    nickname: doc.nickname,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    reviewedAt: doc.reviewedAt?.toISOString(),
  };
}

export async function countActiveUsers(): Promise<number> {
  await connectDB();
  return User.countDocuments();
}

export async function isLoginIdTaken(loginId: string): Promise<boolean> {
  await connectDB();
  const normalized = loginId.trim().toLowerCase();
  const [user, pending] = await Promise.all([
    User.exists({ loginId: normalized }),
    SignupRequest.exists({ loginId: normalized, status: "pending" }),
  ]);
  return Boolean(user || pending);
}

export async function createSignupRequest(input: {
  loginId: string;
  nickname: string;
  password: string;
}): Promise<SignupRequestSummary> {
  await connectDB();

  if (await isLoginIdTaken(input.loginId)) {
    throw new Error("LOGIN_ID_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const doc = await SignupRequest.create({
    loginId: input.loginId.trim().toLowerCase(),
    nickname: input.nickname.trim(),
    passwordHash,
    status: "pending",
  });

  return toSummary(doc);
}

export async function listSignupRequests(
  status: ISignupRequest["status"] = "pending"
): Promise<SignupRequestSummary[]> {
  await connectDB();
  const docs = await SignupRequest.find({ status })
    .select("loginId nickname status createdAt reviewedAt")
    .sort({ createdAt: 1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    loginId: doc.loginId,
    nickname: doc.nickname,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    reviewedAt: doc.reviewedAt?.toISOString(),
  }));
}

export async function approveSignupRequest(requestId: string): Promise<void> {
  await connectDB();

  if ((await countActiveUsers()) >= MAX_APP_USERS) {
    throw new Error("USER_LIMIT_REACHED");
  }

  const request = await SignupRequest.findById(requestId).select(
    "+passwordHash loginId nickname status"
  );

  if (!request || request.status !== "pending") {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (await User.exists({ loginId: request.loginId })) {
    request.status = "rejected";
    request.reviewedAt = new Date();
    await request.save();
    throw new Error("LOGIN_ID_TAKEN");
  }

  const recoveryKeyHash = hashRecoveryKey(generateRecoveryKey());
  await createMemberUser(
    request.loginId,
    request.nickname,
    request.passwordHash,
    recoveryKeyHash
  );

  request.status = "approved";
  request.reviewedAt = new Date();
  await request.save();
}

export async function rejectSignupRequest(requestId: string): Promise<void> {
  await connectDB();
  const request = await SignupRequest.findById(requestId);

  if (!request || request.status !== "pending") {
    throw new Error("REQUEST_NOT_FOUND");
  }

  request.status = "rejected";
  request.reviewedAt = new Date();
  await request.save();
}
