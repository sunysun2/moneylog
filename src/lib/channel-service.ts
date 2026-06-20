import mongoose, { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Channel, type IChannel } from "@/models/Channel";
import type { ChannelData } from "@/components/channels/types";
import type { ContentFormat } from "@/models/Channel";

type AccountRef = Types.ObjectId | { _id: Types.ObjectId } | null | undefined;

function getAccountRefId(ref: AccountRef): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "object" && "_id" in ref && ref._id) {
    return ref._id.toString();
  }
  return ref.toString();
}

function serializeChannel(doc: IChannel): ChannelData {
  const youtube = doc.populated("youtubeAccount") as
    | { _id: { toString(): string }; accountId: string }
    | undefined;
  const adsense = doc.populated("adsenseAccount") as
    | { _id: { toString(): string }; accountId: string }
    | undefined;

  return {
    id: doc._id.toString(),
    name: doc.name,
    handle: doc.handle,
    template: doc.template,
    category: doc.category,
    country: doc.country,
    contentFormat: doc.contentFormat ?? undefined,
    createdDate: doc.createdDate?.toISOString(),
    hasRevenue: doc.hasRevenue,
    status: doc.status,
    warningDates:
      doc.warningDates && doc.warningDates.length > 0
        ? doc.warningDates.map((date) => date.toISOString())
        : (doc as IChannel & { warningDate?: Date }).warningDate
          ? [(doc as IChannel & { warningDate?: Date }).warningDate!.toISOString()]
          : [],
    inactiveDate: doc.inactiveDate?.toISOString(),
    deletedDate: doc.deletedDate?.toISOString(),
    youtubeAccountId: getAccountRefId(doc.youtubeAccount as AccountRef),
    youtubeAccountLabel: youtube?.accountId,
    adsenseAccountId: getAccountRefId(doc.adsenseAccount as AccountRef),
    adsenseAccountLabel: adsense?.accountId,
    monetizationType: doc.monetizationType,
    monetizationDate: doc.monetizationDate?.toISOString(),
    purchaseSource: doc.purchaseSource,
    seller: doc.seller,
    priceUsd: doc.priceUsd,
    priceKrw: doc.priceKrw,
    purchaseDate: doc.purchaseDate?.toISOString(),
    startDate: doc.startDate?.toISOString(),
    purchaseCountry: doc.purchaseCountry,
    purchaseCategory: doc.purchaseCategory,
    sortOrder: doc.sortOrder,
  };
}

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return undefined;
  return num;
}

function normalizeContentFormat(value: unknown): ContentFormat | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (value === "short" || value === "mid" || value === "long") return value;
  return undefined;
}

function normalizeObjectId(value: unknown): Types.ObjectId | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  let idValue: unknown = value;
  if (typeof idValue === "object" && idValue !== null && "_id" in idValue) {
    idValue = (idValue as { _id: unknown })._id;
  }

  if (typeof idValue === "string" && mongoose.Types.ObjectId.isValid(idValue)) {
    return new mongoose.Types.ObjectId(idValue);
  }

  return undefined;
}

export function sanitizeChannelPayload(
  data: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };

  for (const field of ["youtubeAccount", "adsenseAccount"]) {
    if (field in out) {
      const parsed = normalizeObjectId(out[field]);
      if (parsed === undefined) delete out[field];
      else out[field] = parsed;
    }
  }

  if ("warningDates" in out) {
    if (!Array.isArray(out.warningDates)) {
      out.warningDates = [];
    } else {
      out.warningDates = out.warningDates
        .map((value) => parseOptionalDate(value))
        .filter((value): value is Date => value instanceof Date);
    }
  }

  for (const field of [
    "createdDate",
    "monetizationDate",
    "purchaseDate",
    "startDate",
    "inactiveDate",
    "deletedDate",
  ]) {
    if (field in out) {
      const parsed = parseOptionalDate(out[field]);
      if (parsed === undefined) delete out[field];
      else out[field] = parsed;
    }
  }

  for (const field of ["priceUsd", "priceKrw"]) {
    if (field in out) {
      const parsed = parseOptionalNumber(out[field]);
      if (parsed === undefined) delete out[field];
      else out[field] = parsed;
    }
  }

  if ("contentFormat" in out) {
    const parsed = normalizeContentFormat(out.contentFormat);
    if (parsed === undefined) delete out.contentFormat;
    else out.contentFormat = parsed;
  }

  return out;
}

function applyChannelPayload(doc: IChannel, data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    (doc as unknown as Record<string, unknown>)[key] = value;
  }
}

export async function listChannels(): Promise<ChannelData[]> {
  await connectDB();
  const docs = await Channel.find()
    .sort({ sortOrder: 1, createdAt: 1 })
    .populate("youtubeAccount", "accountId")
    .populate("adsenseAccount", "accountId");
  return docs.map(serializeChannel);
}

export async function createChannel(
  data: Record<string, unknown>
): Promise<ChannelData> {
  await connectDB();
  const count = await Channel.countDocuments();
  const doc = new Channel();
  applyChannelPayload(doc, sanitizeChannelPayload({ ...data, sortOrder: count }));
  await doc.save();
  await doc.populate([
    { path: "youtubeAccount", select: "accountId" },
    { path: "adsenseAccount", select: "accountId" },
  ]);
  return serializeChannel(doc);
}

export async function updateChannel(
  id: string,
  data: Record<string, unknown>
): Promise<ChannelData | null> {
  await connectDB();
  const doc = await Channel.findById(id);
  if (!doc) return null;

  applyChannelPayload(doc, sanitizeChannelPayload(data));
  await doc.save();
  await doc.populate([
    { path: "youtubeAccount", select: "accountId" },
    { path: "adsenseAccount", select: "accountId" },
  ]);
  return serializeChannel(doc);
}

export async function deleteChannel(id: string): Promise<boolean> {
  await connectDB();
  const result = await Channel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function reorderChannels(
  items: { id: string; sortOrder: number }[]
): Promise<void> {
  await connectDB();
  await Promise.all(
    items.map((item) =>
      Channel.findByIdAndUpdate(item.id, { sortOrder: item.sortOrder })
    )
  );
}
