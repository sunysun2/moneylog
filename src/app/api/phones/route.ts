import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
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
  const { error } = await requireSession();
  if (error) return error;

  try {
    const devices = await listPhoneDevices();
    return NextResponse.json(devices);
  } catch {
    return NextResponse.json(
      { error: "휴대폰 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await request.json();
    const device = await createPhoneDevice(parseBody(body));
    return NextResponse.json(device, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "휴대폰을 추가하지 못했습니다." },
      { status: 500 }
    );
  }
}
