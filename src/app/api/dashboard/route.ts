import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { getDashboardData } from "@/lib/dashboard-service";

export async function GET(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const referenceDate = new URL(request.url).searchParams.get("referenceDate") ?? undefined;
    const data = await getDashboardData(ctx, referenceDate);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "?? ???? ???? ?????." },
      { status: 500 }
    );
  }
}
