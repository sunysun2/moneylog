import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDashboardData } from "@/lib/dashboard-service";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "통합 리포트를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
