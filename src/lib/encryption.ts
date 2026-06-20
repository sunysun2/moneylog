export function getFieldEncryptionKey(): string {
  const key = process.env.FIELD_ENCRYPTION_KEY;
  if (key) {
    return key;
  }

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "build-placeholder-encryption-key-32b";
  }

  throw new Error("FIELD_ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다.");
}
