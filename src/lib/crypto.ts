import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export function generateRecoveryKey(): string {
  return randomBytes(18).toString("base64url").slice(0, 24);
}

export function hashRecoveryKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
