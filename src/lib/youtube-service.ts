import { connectDB } from "@/lib/db";
import { hashForSearch } from "@/lib/hash";
import { YoutubeAccount, type IYoutubeAccount } from "@/models/YoutubeAccount";
import type { YoutubeAccountData } from "@/components/youtube/types";

function serializeAccount(doc: IYoutubeAccount): YoutubeAccountData {
  return {
    id: doc._id.toString(),
    accountId: doc.accountId,
    password: doc.password,
    adsenseAccount: doc.adsenseAccount,
    phone: doc.phone,
    origin: doc.origin,
    isInUse: doc.isInUse,
    channelName: doc.apiKey,
    adsenseStatus: doc.adsenseStatus,
    otpInUse: doc.otpInUse ?? true,
    otps: doc.otps ?? [],
    createdDate: doc.createdDate?.toISOString(),
    purchaseSource: doc.purchaseSource,
    seller: doc.seller,
    priceUsd: doc.priceUsd,
    priceKrw: doc.priceKrw,
    purchaseDate: doc.purchaseDate?.toISOString(),
    accountCreatedDate: doc.accountCreatedDate?.toISOString(),
    status: doc.status,
    sortOrder: doc.sortOrder,
  };
}

export async function listYoutubeAccounts(): Promise<YoutubeAccountData[]> {
  await connectDB();
  const docs = await YoutubeAccount.find().sort({ sortOrder: 1, createdAt: 1 });
  return docs.map(serializeAccount);
}

export async function createYoutubeAccount(
  data: Record<string, unknown>
): Promise<YoutubeAccountData> {
  await connectDB();
  const count = await YoutubeAccount.countDocuments();
  const doc = await YoutubeAccount.create({
    ...data,
    accountIdHash: hashForSearch(String(data.accountId)),
    sortOrder: count,
  });
  return serializeAccount(doc);
}

export async function updateYoutubeAccount(
  id: string,
  data: Record<string, unknown>
): Promise<YoutubeAccountData | null> {
  await connectDB();
  const doc = await YoutubeAccount.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
  return doc ? serializeAccount(doc) : null;
}

export async function deleteYoutubeAccount(id: string): Promise<boolean> {
  await connectDB();
  const result = await YoutubeAccount.findByIdAndDelete(id);
  return Boolean(result);
}

export async function reorderYoutubeAccounts(
  items: { id: string; sortOrder: number }[]
): Promise<void> {
  await connectDB();
  await Promise.all(
    items.map((item) =>
      YoutubeAccount.findByIdAndUpdate(item.id, { sortOrder: item.sortOrder })
    )
  );
}
