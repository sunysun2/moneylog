import { connectDB } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { User } from "@/models/User";

export async function verifyMasterPassword(
  password: string
): Promise<{ ok: true } | { ok: false; reason: "missing" | "invalid" }> {
  const trimmed = password.trim();
  if (trimmed.length < 8) {
    return { ok: false, reason: "invalid" };
  }

  await connectDB();
  const user = await User.findOne().select("passwordHash").lean();
  if (!user) {
    return { ok: false, reason: "missing" };
  }

  const valid = await verifyPassword(trimmed, user.passwordHash);
  if (!valid) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true };
}
