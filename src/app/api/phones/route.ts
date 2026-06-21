import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import {
  createPhoneDevice,
  listPhoneDevices,
} from "@/lib/phone-service";

function parseBody(body: Record<string, unknown>) {
  return {
    ...body,
    purchaseDate: body.purchaseDate ? new Date(String(body.purchaseDate)) : undefined,
    paymentDay:
      body.paymentDay != null && body.paymentDay !== ""
        ? Number(body.paymentDay)
        : undefined,
  };
}

export async function GET() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const devices = await listPhoneDevices(ctx);
    return NextResponse.json(devices);
  } catch {
    return NextResponse.json(
      { error: "??? ??? ???? ?????." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const body = await request.json();
    const device = await createPhoneDevice(ctx, parseBody(body));
    return NextResponse.json(device, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "???? ???? ?????." },
      { status: 500 }
    );
  }
}
