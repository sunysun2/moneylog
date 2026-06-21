import { type Model, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { hashForSearch } from "@/lib/hash";
import { ownerFilter, toOwnerObjectId, type OwnerContext } from "@/lib/owner-query";
import {
  AdsenseAccount,
  Channel,
  ChannelPreference,
  Freelancer,
  PhoneDevice,
  Transaction,
  User,
  YoutubeAccount,
} from "@/models";

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_APP_ID = "moneylog";

export interface BackupCollections {
  users: Record<string, unknown>[];
  youtubeAccounts: Record<string, unknown>[];
  adsenseAccounts: Record<string, unknown>[];
  channels: Record<string, unknown>[];
  channelPreferences: Record<string, unknown>[];
  phoneDevices: Record<string, unknown>[];
  freelancers: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
}

export interface BackupPayload {
  version: number;
  app: string;
  exportedAt: string;
  collections: BackupCollections;
}

const COLLECTION_KEYS = [
  "users",
  "youtubeAccounts",
  "adsenseAccounts",
  "channels",
  "channelPreferences",
  "phoneDevices",
  "freelancers",
  "transactions",
] as const;

type CollectionKey = (typeof COLLECTION_KEYS)[number];

const RESTORE_ORDER: { key: CollectionKey; model: Model<unknown> }[] = [
  { key: "users", model: User as Model<unknown> },
  { key: "youtubeAccounts", model: YoutubeAccount as Model<unknown> },
  { key: "adsenseAccounts", model: AdsenseAccount as Model<unknown> },
  { key: "channels", model: Channel as Model<unknown> },
  { key: "channelPreferences", model: ChannelPreference as Model<unknown> },
  { key: "phoneDevices", model: PhoneDevice as Model<unknown> },
  { key: "freelancers", model: Freelancer as Model<unknown> },
  { key: "transactions", model: Transaction as Model<unknown> },
];

const USER_OWNED_KEYS: CollectionKey[] = [
  "youtubeAccounts",
  "adsenseAccounts",
  "channels",
  "channelPreferences",
  "phoneDevices",
  "freelancers",
  "transactions",
];

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

function reviveValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(reviveValue);
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(obj)) {
      out[key] = reviveValue(nested);
    }
    return out;
  }

  if (typeof value === "string" && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }

  return value;
}

function toObjectId(value: unknown): Types.ObjectId | undefined {
  if (!value) return undefined;
  if (value instanceof Types.ObjectId) return value;
  if (typeof value === "string" && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }
  return undefined;
}

function normalizeDocForImport(
  rawDoc: Record<string, unknown>,
  collectionKey: CollectionKey,
  ownerId: Types.ObjectId
): Record<string, unknown> {
  const doc = reviveValue({ ...rawDoc }) as Record<string, unknown>;

  const objectId = toObjectId(doc._id);
  if (objectId) {
    doc._id = objectId;
  }

  if (collectionKey !== "users") {
    doc.ownerId = ownerId;
  }

  if (collectionKey === "adsenseAccounts") {
    const linkedYoutubeAccount = toObjectId(doc.linkedYoutubeAccount);
    if (linkedYoutubeAccount) {
      doc.linkedYoutubeAccount = linkedYoutubeAccount;
    } else {
      delete doc.linkedYoutubeAccount;
    }
  }

  if (collectionKey === "channels") {
    const youtubeAccount = toObjectId(doc.youtubeAccount);
    const adsenseAccount = toObjectId(doc.adsenseAccount);
    if (youtubeAccount) doc.youtubeAccount = youtubeAccount;
    else delete doc.youtubeAccount;
    if (adsenseAccount) doc.adsenseAccount = adsenseAccount;
    else delete doc.adsenseAccount;
  }

  if (
    (collectionKey === "youtubeAccounts" || collectionKey === "adsenseAccounts") &&
    typeof doc.accountId === "string"
  ) {
    doc.accountIdHash = hashForSearch(doc.accountId);
  }

  return doc;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseBackupPayload(json: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("INVALID_PAYLOAD");
  }

  if (!isPlainObject(parsed)) {
    throw new Error("INVALID_PAYLOAD");
  }

  if (parsed.version !== BACKUP_FORMAT_VERSION || parsed.app !== BACKUP_APP_ID) {
    throw new Error("UNSUPPORTED_BACKUP");
  }

  if (!isPlainObject(parsed.collections)) {
    throw new Error("INVALID_PAYLOAD");
  }

  const collections = parsed.collections as Record<string, unknown>;
  for (const key of COLLECTION_KEYS) {
    if (!Array.isArray(collections[key])) {
      throw new Error("INVALID_PAYLOAD");
    }
  }

  return parsed as unknown as BackupPayload;
}

export async function exportBackupData(ctx: OwnerContext): Promise<BackupPayload> {
  await connectDB();
  const filter = ownerFilter(ctx.ownerId, ctx.isAdmin);
  const ownerObjectId = toOwnerObjectId(ctx.ownerId);

  const collections = {} as BackupCollections;
  for (const { key, model } of RESTORE_ORDER) {
    if (key === "users") {
      const user = await User.findById(ownerObjectId).lean();
      collections.users = user ? [user as Record<string, unknown>] : [];
    } else {
      collections[key] = (await model.find(filter).lean()) as Record<string, unknown>[];
    }
  }

  return {
    version: BACKUP_FORMAT_VERSION,
    app: BACKUP_APP_ID,
    exportedAt: new Date().toISOString(),
    collections,
  };
}

async function deleteOwnerData(ctx: OwnerContext): Promise<void> {
  const filter = ownerFilter(ctx.ownerId, ctx.isAdmin);
  for (const key of [...USER_OWNED_KEYS].reverse()) {
    const entry = RESTORE_ORDER.find((item) => item.key === key);
    if (entry) {
      await entry.model.deleteMany(filter);
    }
  }
}

async function replaceOwnerData(
  ctx: OwnerContext,
  payload: BackupPayload
): Promise<{ counts: Record<string, number> }> {
  const counts: Record<string, number> = {};
  const ownerObjectId = toOwnerObjectId(ctx.ownerId);

  await deleteOwnerData(ctx);

  for (const { key, model } of RESTORE_ORDER) {
    if (key === "users") {
      counts[key] = 0;
      continue;
    }

    const docs = payload.collections[key] ?? [];
    if (docs.length === 0) {
      counts[key] = 0;
      continue;
    }

    const normalized = docs.map((doc) =>
      normalizeDocForImport(doc as Record<string, unknown>, key, ownerObjectId)
    );

    await model.create(normalized);
    counts[key] = normalized.length;
  }

  return { counts };
}

export async function importBackupData(
  ctx: OwnerContext,
  payload: BackupPayload
): Promise<{ counts: Record<string, number> }> {
  await connectDB();

  let snapshot: BackupPayload | null = null;
  try {
    snapshot = await exportBackupData(ctx);
  } catch (err) {
    console.error("백업 복원 전 스냅샷 생성 실패:", err);
  }

  try {
    return await replaceOwnerData(ctx, payload);
  } catch (err) {
    if (snapshot) {
      try {
        await replaceOwnerData(ctx, snapshot);
      } catch (restoreErr) {
        console.error("백업 복원 롤백 실패:", restoreErr);
        throw new Error("IMPORT_FAILED_AND_RESTORE_FAILED");
      }
    }

    throw err;
  }
}
