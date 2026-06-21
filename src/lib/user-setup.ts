import { User } from "@/models/User";

export async function isAdminSetupComplete(): Promise<boolean> {
  return Boolean(
    await User.exists({
      role: "admin",
      loginId: { $exists: true, $ne: "" },
    })
  );
}

export async function clearLegacyUsers(): Promise<number> {
  const result = await User.deleteMany({
    $or: [{ loginId: { $exists: false } }, { loginId: null }, { loginId: "" }],
  });
  return result.deletedCount ?? 0;
}

export async function findLegacyUser() {
  return User.findOne({
    $or: [{ loginId: { $exists: false } }, { loginId: null }, { loginId: "" }],
  }).select("passwordHash loginId nickname role");
}
