import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listAllFreelancerExpenses } from "@/lib/freelancer-service";
import type { FreelancerExpensePeriod } from "@/components/freelancers/types";

function parsePeriod(value: string | null): FreelancerExpensePeriod | null {
  if (
    value === "all" ||
    value === "today" ||
    value === "1w" ||
    value === "month" ||
    value === "3m"
  ) {
    return value;
  }
  return null;
}

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const period = parsePeriod(new URL(request.url).searchParams.get("period"));

  if (!period) {
    return NextResponse.json({ error: "조회 기간이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const result = await listAllFreelancerExpenses(period);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "프리랜서 지출 내역을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
