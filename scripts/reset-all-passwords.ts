import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const RESET_PLACEHOLDER = "(초기화됨)";

function loadEnvLocal() {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) {
    throw new Error(".env.local 파일을 찾을 수 없습니다.");
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

async function resetEncryptedAccountPasswords(
  YoutubeAccount: typeof import("../src/models/YoutubeAccount").YoutubeAccount,
  AdsenseAccount: typeof import("../src/models/AdsenseAccount").AdsenseAccount,
  PhoneDevice: typeof import("../src/models/PhoneDevice").PhoneDevice
) {
  let youtubeCount = 0;
  for (const doc of await YoutubeAccount.find()) {
    doc.password = RESET_PLACEHOLDER;
    doc.apiKey = undefined;
    doc.phone = undefined;
    doc.otps = [];
    await doc.save();
    youtubeCount += 1;
  }

  let adsenseCount = 0;
  for (const doc of await AdsenseAccount.find()) {
    doc.password = RESET_PLACEHOLDER;
    doc.accountNumber = undefined;
    doc.phone = undefined;
    doc.address = undefined;
    doc.otps = [];
    await doc.save();
    adsenseCount += 1;
  }

  let phoneCount = 0;
  for (const doc of await PhoneDevice.find()) {
    doc.devicePhone = RESET_PLACEHOLDER;
    doc.accountNumber = undefined;
    await doc.save();
    phoneCount += 1;
  }

  return { youtubeCount, adsenseCount, phoneCount };
}

async function main() {
  loadEnvLocal();

  const mongoose = (await import("mongoose")).default;
  const { connectDB } = await import("../src/lib/db");
  const { User } = await import("../src/models/User");
  const { YoutubeAccount } = await import("../src/models/YoutubeAccount");
  const { AdsenseAccount } = await import("../src/models/AdsenseAccount");
  const { PhoneDevice } = await import("../src/models/PhoneDevice");

  await connectDB();

  const userResult = await User.deleteMany({});
  const accounts = await resetEncryptedAccountPasswords(
    YoutubeAccount,
    AdsenseAccount,
    PhoneDevice
  );

  console.log("비밀번호 초기화 완료");
  console.log(`- 관리자 계정 삭제: ${userResult.deletedCount}건`);
  console.log(`- 유튜브 계정 비밀번호 초기화: ${accounts.youtubeCount}건`);
  console.log(`- 애드센스 계정 비밀번호 초기화: ${accounts.adsenseCount}건`);
  console.log(`- 휴대폰 민감 정보 초기화: ${accounts.phoneCount}건`);
  console.log("");
  console.log("다음 단계:");
  console.log("1. http://localhost:3000/setup 에서 새 마스터 비밀번호를 설정하세요.");
  console.log("2. 표시되는 비상 복구 키를 반드시 안전한 곳에 보관하세요.");
  console.log("3. 각 탭에서 계정 비밀번호·OTP·전화번호 등을 다시 입력하세요.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("초기화 실패:", err);
  process.exit(1);
});
