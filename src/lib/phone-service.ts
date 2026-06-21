import { connectDB } from "@/lib/db";
import {
  mergeOwnerFilter,
  ownerFilter,
  toOwnerObjectId,
  type OwnerContext,
} from "@/lib/owner-query";
import { PhoneDevice, type IPhoneDevice } from "@/models/PhoneDevice";
import type { PhoneDeviceData } from "@/components/phones/types";

function serializeDevice(doc: IPhoneDevice): PhoneDeviceData {
  return {
    id: doc._id.toString(),
    devicePhone: doc.devicePhone,
    phoneModel: doc.phoneModel,
    mobileCarrier: doc.mobileCarrier,
    mvnoProvider: doc.mvnoProvider,
    mobilePlan: doc.mobilePlan,
    ratePlan: doc.ratePlan,
    purchaseSource: doc.purchaseSource,
    priceKrw: doc.priceKrw,
    purchaseDate: doc.purchaseDate?.toISOString(),
    bank: doc.bank,
    accountNumber: doc.accountNumber,
    paymentDay: doc.paymentDay,
    sortOrder: doc.sortOrder,
  };
}

function applyPayload(doc: IPhoneDevice, data: Record<string, unknown>) {
  const fields = [
    "devicePhone",
    "phoneModel",
    "mobileCarrier",
    "mvnoProvider",
    "mobilePlan",
    "ratePlan",
    "purchaseSource",
    "priceKrw",
    "purchaseDate",
    "bank",
    "accountNumber",
    "paymentDay",
    "sortOrder",
  ] as const;

  for (const field of fields) {
    if (field in data) {
      doc.set(field, data[field]);
    }
  }
}

export async function listPhoneDevices(ctx: OwnerContext): Promise<PhoneDeviceData[]> {
  await connectDB();
  const docs = await PhoneDevice.find(ownerFilter(ctx.ownerId, ctx.isAdmin)).sort({
    sortOrder: 1,
    createdAt: 1,
  });
  return docs.map(serializeDevice);
}

export async function createPhoneDevice(
  ctx: OwnerContext,
  data: Record<string, unknown>
): Promise<PhoneDeviceData> {
  await connectDB();
  const count = await PhoneDevice.countDocuments(ownerFilter(ctx.ownerId, ctx.isAdmin));
  const doc = new PhoneDevice();
  applyPayload(doc, { ...data, sortOrder: count });
  doc.ownerId = toOwnerObjectId(ctx.ownerId);
  await doc.save();
  return serializeDevice(doc);
}

export async function updatePhoneDevice(
  ctx: OwnerContext,
  id: string,
  data: Record<string, unknown>
): Promise<PhoneDeviceData | null> {
  await connectDB();
  const doc = await PhoneDevice.findOne(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin)
  );
  if (!doc) return null;

  applyPayload(doc, data);
  await doc.save();
  return serializeDevice(doc);
}

export async function deletePhoneDevice(ctx: OwnerContext, id: string): Promise<boolean> {
  await connectDB();
  const result = await PhoneDevice.findOneAndDelete(
    mergeOwnerFilter({ _id: id }, ctx.ownerId, ctx.isAdmin)
  );
  return Boolean(result);
}

export async function reorderPhoneDevices(
  ctx: OwnerContext,
  items: { id: string; sortOrder: number }[]
): Promise<void> {
  await connectDB();
  await Promise.all(
    items.map((item) =>
      PhoneDevice.findOneAndUpdate(
        mergeOwnerFilter({ _id: item.id }, ctx.ownerId, ctx.isAdmin),
        { sortOrder: item.sortOrder }
      )
    )
  );
}
