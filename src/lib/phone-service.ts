import { connectDB } from "@/lib/db";
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

export async function listPhoneDevices(): Promise<PhoneDeviceData[]> {
  await connectDB();
  const docs = await PhoneDevice.find().sort({ sortOrder: 1, createdAt: 1 });
  return docs.map(serializeDevice);
}

export async function createPhoneDevice(
  data: Record<string, unknown>
): Promise<PhoneDeviceData> {
  await connectDB();
  const count = await PhoneDevice.countDocuments();
  const doc = new PhoneDevice();
  applyPayload(doc, { ...data, sortOrder: count });
  await doc.save();
  return serializeDevice(doc);
}

export async function updatePhoneDevice(
  id: string,
  data: Record<string, unknown>
): Promise<PhoneDeviceData | null> {
  await connectDB();
  const doc = await PhoneDevice.findById(id);
  if (!doc) return null;

  applyPayload(doc, data);
  await doc.save();
  return serializeDevice(doc);
}

export async function deletePhoneDevice(id: string): Promise<boolean> {
  await connectDB();
  const result = await PhoneDevice.findByIdAndDelete(id);
  return Boolean(result);
}

export async function reorderPhoneDevices(
  items: { id: string; sortOrder: number }[]
): Promise<void> {
  await connectDB();
  await Promise.all(
    items.map((item) =>
      PhoneDevice.findByIdAndUpdate(item.id, { sortOrder: item.sortOrder })
    )
  );
}
