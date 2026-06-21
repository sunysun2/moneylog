import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "crypto";

const BACKUP_CRYPTO_VERSION = 1;
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 210_000;

export interface BackupEnvelope {
  v: number;
  alg: "aes-256-gcm";
  kdf: "pbkdf2";
  iterations: number;
  salt: string;
  iv: string;
  tag: string;
  data: string;
}

function deriveKey(password: string, salt: Buffer, iterations: number): Buffer {
  return pbkdf2Sync(password, salt, iterations, KEY_LENGTH, "sha256");
}

export function encryptBackupPayload(plaintext: string, password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt, PBKDF2_ITERATIONS);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const envelope: BackupEnvelope = {
    v: BACKUP_CRYPTO_VERSION,
    alg: "aes-256-gcm",
    kdf: "pbkdf2",
    iterations: PBKDF2_ITERATIONS,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  };

  return JSON.stringify(envelope);
}

export function decryptBackupPayload(envelopeText: string, password: string): string {
  let envelope: BackupEnvelope;
  try {
    envelope = JSON.parse(envelopeText) as BackupEnvelope;
  } catch {
    throw new Error("INVALID_ENVELOPE");
  }

  if (
    envelope.v !== BACKUP_CRYPTO_VERSION ||
    envelope.alg !== "aes-256-gcm" ||
    envelope.kdf !== "pbkdf2" ||
    !envelope.salt ||
    !envelope.iv ||
    !envelope.tag ||
    !envelope.data
  ) {
    throw new Error("INVALID_ENVELOPE");
  }

  const salt = Buffer.from(envelope.salt, "base64");
  const iv = Buffer.from(envelope.iv, "base64");
  const tag = Buffer.from(envelope.tag, "base64");
  const encrypted = Buffer.from(envelope.data, "base64");
  const key = deriveKey(password, salt, envelope.iterations);

  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error("DECRYPT_FAILED");
  }
}
