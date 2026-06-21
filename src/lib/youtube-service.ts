import { connectDB } from "@/lib/db";
import { hashForSearch } from "@/lib/hash";
import {
  mergeOwnerFilter,
  ownerFilter,
  toOwnerObjectId,
  type OwnerContext,
} from "@/lib/owner-query";
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

export async function listYoutubeAccounts(ctx: OwnerContext): Promise<YoutubeAccountData[]> {
  await connectDB();
  const docs = await YoutubeAccount.find(ownerFilter(ctx.ownerId, ctx.isAdmin)).sort({
    sortOrder: 1,
    createdAt: 1,
  });
  return docs.map(serializeAccount);
}

export async function createYoutubeAccount(
  ctx: OwnerContext,
  data: Record<string, unknown>
): Promise<YoutubeAccountData> {
  await connectDB();
  const count = await YoutubeAccount.countDocuments(ownerFilter(ctx.ownerId, ctx.isAdmin));
  const doc = await YoutubeAccount.create({
    ...data,
    accountIdHash: hashForSearch(String(data.accountId)),
    sortOrder: count,
    ownerId: toOwnerObjectId(ctx.ownerId),
  });
  return serializeAccount(doc);
}

export async function updateYoutubeAccount(
  ctx: OwnerContext,
  id: string,
  data: Record<string, unknown>
): Promise<YoutubeAccountData | null> {
  await connectDB();
  const doc = await YoutubeAccount.findOneAndUpdate(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin),
    { $set: data },
    { new: true, runValidators: true }
  );
  return doc ? serializeAccount(doc) : null;
}

export async function deleteYoutubeAccount(ctx: OwnerContext, id: string): Promise<boolean> {
  await connectDB();
  const result = await YoutubeAccount.findOneAndDelete(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin)
  );
  return Boolean(result);
}

export async function reorderYoutubeAccounts(
  ctx: OwnerContext,
  items: { id: string; sortOrder: number }[]
): Promise<void> {
  await connectDB();
  await Promise.all(
    items.map((item) =>
      YoutubeAccount.findOneAndUpdate(
        mergeOwnerFilter({ _id: item.id }, ctx.ownerId, ctx.isAdmin),
        { sortOrder: item.sortOrder }
      )
    )
  );
}
