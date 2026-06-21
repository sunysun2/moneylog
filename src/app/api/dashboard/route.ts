import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDashboardData } from "@/lib/dashboard-service";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const referenceDate = new URL(request.url).searchParams.get("referenceDate") ?? undefined;
    const data = await getDashboardData(referenceDate);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "통합 리포트를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
