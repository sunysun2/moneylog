import { connectDB } from "@/lib/db";
import { hashForSearch } from "@/lib/hash";
import {
  mergeOwnerFilter,
  ownerFilter,
  toOwnerObjectId,
  type OwnerContext,
} from "@/lib/owner-query";
import { AdsenseAccount, type IAdsenseAccount } from "@/models/AdsenseAccount";
import { YoutubeAccount } from "@/models/YoutubeAccount";
import type { AdsenseAccountData, LinkedYoutubeEntry } from "@/components/adsense/types";
import { MAX_LINKED_YOUTUBE_ACCOUNTS } from "@/components/adsense/types";
import type { OtpEntry } from "@/components/youtube/types";
import type { AccountStatus } from "@/models/AdsenseAccount";
import type { AdsenseLinkStatus } from "@/models/YoutubeAccount";

export interface YoutubeLinkData {
  youtubeAccountId: string;
  youtubeAccountLabel: string;
  password: string;
  phone?: string;
  channelName?: string;
  otpInUse: boolean;
  otps: OtpEntry[];
}

function serializeAccount(doc: IAdsenseAccount): AdsenseAccountData {
  return {
    id: doc._id.toString(),
    accountId: doc.accountId,
    password: doc.password,
    holderName: doc.holderName,
    youtubeAccount: doc.youtubeAccount,
    channelName: doc.channelName,
    bank: doc.bank,
    accountNumber: doc.accountNumber,
    phone: doc.phone,
    address: doc.address,
    appliedDate: doc.appliedDate?.toISOString(),
    arrivedDate: doc.arrivedDate?.toISOString(),
    status: doc.status,
    otpInUse: doc.otpInUse ?? true,
    otps: doc.otps ?? [],
    linkedYoutubeAccountId: doc.linkedYoutubeAccount?.toString(),
    sortOrder: doc.sortOrder,
  };
}

function serializeYoutubeLink(youtube: {
  _id: { toString(): string };
  accountId: string;
  password: string;
  phone?: string;
  apiKey?: string;
  otpInUse?: boolean;
  otps?: OtpEntry[];
}) {
  return {
    youtubeAccountId: youtube._id.toString(),
    youtubeAccountLabel: youtube.accountId,
    password: youtube.password,
    phone: youtube.phone,
    channelName: youtube.apiKey,
    otpInUse: youtube.otpInUse ?? true,
    otps: (youtube.otps ?? []) as OtpEntry[],
  } satisfies YoutubeLinkData;
}

function normalizeAccountLabel(value: string) {
  return value.trim().toLowerCase();
}

async function findAllYoutubeByAdsenseAccountRef(
  ctx: OwnerContext,
  adsenseAccountId: string
) {
  await connectDB();
  const normalized = normalizeAccountLabel(adsenseAccountId);
  if (!normalized) return [];

  const docs = await YoutubeAccount.find(
    mergeOwnerFilter(
      { adsenseAccount: { $exists: true, $nin: [null, ""] } },
      ctx.ownerId,
      ctx.isAdmin
    )
  ).sort({ sortOrder: 1, createdAt: 1 });

  return docs
    .filter(
      (doc) => normalizeAccountLabel(doc.adsenseAccount ?? "") === normalized
    )
    .slice(0, MAX_LINKED_YOUTUBE_ACCOUNTS);
}

async function findYoutubeByAdsenseAccountRef(
  ctx: OwnerContext,
  adsenseAccountId: string
) {
  const docs = await findAllYoutubeByAdsenseAccountRef(ctx, adsenseAccountId);
  return docs[0] ?? null;
}

export async function findYoutubeLinkById(ctx: OwnerContext, youtubeAccountId: string) {
  await connectDB();
  const youtube = await YoutubeAccount.findOne(
    mergeOwnerFilter({ _id: youtubeAccountId }, ctx.ownerId, ctx.isAdmin)
  );
  if (!youtube) return null;
  return serializeYoutubeLink(youtube);
}

export async function findYoutubeLinkByAccountId(ctx: OwnerContext, accountId: string) {
  await connectDB();
  const youtube = await YoutubeAccount.findOne(
    mergeOwnerFilter(
      { accountIdHash: hashForSearch(accountId) },
      ctx.ownerId,
      ctx.isAdmin
    )
  );

  if (!youtube) return null;

  return serializeYoutubeLink(youtube);
}

export async function findYoutubeLink(
  ctx: OwnerContext,
  options: {
    accountId?: string;
    youtubeAccount?: string;
    youtubeAccountId?: string;
  }
) {
  const adsenseAccountId = options.accountId?.trim();
  const youtubeAccountEmail = options.youtubeAccount?.trim();

  if (adsenseAccountId) {
    const byAdsenseRef = await findYoutubeByAdsenseAccountRef(ctx, adsenseAccountId);
    if (byAdsenseRef) return serializeYoutubeLink(byAdsenseRef);
  }

  if (options.youtubeAccountId) {
    const byId = await findYoutubeLinkById(ctx, options.youtubeAccountId);
    if (byId) return byId;
  }

  if (youtubeAccountEmail) {
    const byYoutubeEmail = await findYoutubeLinkByAccountId(ctx, youtubeAccountEmail);
    if (byYoutubeEmail) return byYoutubeEmail;
  }

  if (adsenseAccountId) {
    const bySameId = await findYoutubeLinkByAccountId(ctx, adsenseAccountId);
    if (bySameId) return bySameId;
  }

  return null;
}

export async function findYoutubeLinks(
  ctx: OwnerContext,
  options: {
    accountId?: string;
    youtubeAccount?: string;
    youtubeAccountId?: string;
  }
): Promise<YoutubeLinkData[]> {
  const adsenseAccountId = options.accountId?.trim();
  const youtubeAccountEmail = options.youtubeAccount?.trim();
  const seen = new Set<string>();
  const links: YoutubeLinkData[] = [];

  function appendLink(link: YoutubeLinkData | null) {
    if (!link || seen.has(link.youtubeAccountId)) return;
    if (links.length >= MAX_LINKED_YOUTUBE_ACCOUNTS) return;
    seen.add(link.youtubeAccountId);
    links.push(link);
  }

  if (adsenseAccountId) {
    const docs = await findAllYoutubeByAdsenseAccountRef(ctx, adsenseAccountId);
    for (const doc of docs) {
      appendLink(serializeYoutubeLink(doc));
    }
    if (links.length > 0) return links;
  }

  if (options.youtubeAccountId) {
    appendLink(await findYoutubeLinkById(ctx, options.youtubeAccountId));
  }

  if (youtubeAccountEmail) {
    appendLink(await findYoutubeLinkByAccountId(ctx, youtubeAccountEmail));
  }

  if (adsenseAccountId) {
    appendLink(await findYoutubeLinkByAccountId(ctx, adsenseAccountId));
  }

  return links;
}

function linksToEntries(links: YoutubeLinkData[]): LinkedYoutubeEntry[] {
  return links.map((link) => ({
    youtubeAccountId: link.youtubeAccountId,
    youtubeAccount: link.youtubeAccountLabel,
    channelName: link.channelName ?? "",
  }));
}

function enrichAccountWithLinks(
  account: AdsenseAccountData,
  links: YoutubeLinkData[]
): AdsenseAccountData {
  const linkedYoutubeAccounts = linksToEntries(links);
  const first = linkedYoutubeAccounts[0];

  return {
    ...account,
    linkedYoutubeAccounts,
    linkedYoutubeCount: linkedYoutubeAccounts.length,
    youtubeAccount: first?.youtubeAccount ?? account.youtubeAccount,
    channelName: first?.channelName ?? account.channelName,
    linkedYoutubeAccountId: first?.youtubeAccountId ?? account.linkedYoutubeAccountId,
  };
}

async function buildYoutubeLinksByAdsenseRef(ctx: OwnerContext) {
  await connectDB();
  const docs = await YoutubeAccount.find(
    mergeOwnerFilter(
      { adsenseAccount: { $exists: true, $nin: [null, ""] } },
      ctx.ownerId,
      ctx.isAdmin
    )
  ).sort({ sortOrder: 1, createdAt: 1 });

  const map = new Map<string, YoutubeLinkData[]>();

  for (const doc of docs) {
    const key = normalizeAccountLabel(doc.adsenseAccount ?? "");
    if (!key) continue;

    const list = map.get(key) ?? [];
    if (list.length >= MAX_LINKED_YOUTUBE_ACCOUNTS) continue;

    list.push(serializeYoutubeLink(doc));
    map.set(key, list);
  }

  return map;
}

function findOtpSecret(otps: OtpEntry[], labels: string[]) {
  const otp = otps.find((o) => labels.includes(o.label));
  return otp?.secret ?? "";
}

function findOtpBackup(otps: OtpEntry[]) {
  const otp = otps.find((o) => o.label === "백업");
  return otp?.notes || otp?.secret || "";
}

function adsenseStatusFromAccountStatus(status: AccountStatus): AdsenseLinkStatus {
  if (status === "pending") return "pending";
  if (status === "inactive" || status === "deleted") return "unlinked";
  return "linked";
}

export async function findAdsenseLinkById(ctx: OwnerContext, adsenseAccountId: string) {
  await connectDB();
  const adsense = await AdsenseAccount.findOne(
    mergeOwnerFilter({ _id: adsenseAccountId }, ctx.ownerId, ctx.isAdmin)
  );
  if (!adsense) return null;

  const otps = (adsense.otps ?? []) as OtpEntry[];

  return {
    adsenseAccountId: adsense._id.toString(),
    adsenseAccountLabel: adsense.accountId,
    phone: adsense.phone,
    otpInUse: adsense.otpInUse ?? true,
    otps,
    otpKey: findOtpSecret(otps, ["앱"]),
    otpBackup: findOtpBackup(otps),
    adsenseStatus: adsenseStatusFromAccountStatus(adsense.status),
  };
}

async function applyYoutubeLink(ctx: OwnerContext, data: Record<string, unknown>) {
  const accountId = String(data.accountId ?? "");
  const youtubeAccount = String(data.youtubeAccount ?? "");
  const linkedYoutubeAccountId = String(data.linkedYoutubeAccount ?? "");

  const links = await findYoutubeLinks(ctx, {
    accountId,
    youtubeAccount,
    youtubeAccountId: linkedYoutubeAccountId,
  });

  const link = links[0] ?? null;

  if (!link) {
    return { ...data, linkedYoutubeAccount: undefined };
  }

  const hasOtps = Array.isArray(data.otps) && data.otps.length > 0;

  return {
    ...data,
    linkedYoutubeAccount: link.youtubeAccountId,
    youtubeAccount: link.youtubeAccountLabel,
    password: data.password || link.password,
    phone: data.phone || link.phone,
    channelName: link.channelName ?? "",
    otpInUse: data.otpInUse ?? link.otpInUse,
    otps: hasOtps ? data.otps : link.otps,
  };
}

export async function listAdsenseAccounts(ctx: OwnerContext): Promise<AdsenseAccountData[]> {
  await connectDB();
  const docs = await AdsenseAccount.find(ownerFilter(ctx.ownerId, ctx.isAdmin)).sort({
    sortOrder: 1,
    createdAt: 1,
  });
  const linkMap = await buildYoutubeLinksByAdsenseRef(ctx);

  return docs.map((doc) => {
    const base = serializeAccount(doc);
    const links = linkMap.get(normalizeAccountLabel(doc.accountId)) ?? [];
    return enrichAccountWithLinks(base, links);
  });
}

export async function createAdsenseAccount(
  ctx: OwnerContext,
  data: Record<string, unknown>
): Promise<AdsenseAccountData> {
  await connectDB();
  const count = await AdsenseAccount.countDocuments(ownerFilter(ctx.ownerId, ctx.isAdmin));
  const payload = await applyYoutubeLink(ctx, {
    ...data,
    accountIdHash: hashForSearch(String(data.accountId)),
    sortOrder: count,
    ownerId: toOwnerObjectId(ctx.ownerId),
  });
  const doc = await AdsenseAccount.create(payload);
  const links = await findYoutubeLinks(ctx, { accountId: String(data.accountId ?? "") });
  return enrichAccountWithLinks(serializeAccount(doc), links);
}

export async function updateAdsenseAccount(
  ctx: OwnerContext,
  id: string,
  data: Record<string, unknown>
): Promise<AdsenseAccountData | null> {
  await connectDB();
  const payload = data.accountId
    ? await applyYoutubeLink(ctx, {
        ...data,
        accountIdHash: hashForSearch(String(data.accountId)),
      })
    : data;

  const doc = await AdsenseAccount.findOneAndUpdate(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin),
    { $set: payload },
    { new: true, runValidators: true }
  );
  if (!doc) return null;

  const links = await findYoutubeLinks(ctx, { accountId: doc.accountId });
  return enrichAccountWithLinks(serializeAccount(doc), links);
}

export async function deleteAdsenseAccount(ctx: OwnerContext, id: string): Promise<boolean> {
  await connectDB();
  const result = await AdsenseAccount.findOneAndDelete(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin)
  );
  return Boolean(result);
}

export async function reorderAdsenseAccounts(
  ctx: OwnerContext,
  items: { id: string; sortOrder: number }[]
): Promise<void> {
  await connectDB();
  await Promise.all(
    items.map((item) =>
      AdsenseAccount.findOneAndUpdate(
        mergeOwnerFilter({ _id: item.id }, ctx.ownerId, ctx.isAdmin),
        { sortOrder: item.sortOrder }
      )
    )
  );
}
