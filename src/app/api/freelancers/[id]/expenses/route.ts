import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { isValidMongoId } from "@/lib/mongodb-id";
import { listFreelancerExpenses } from "@/lib/freelancer-service";
import type { FreelancerExpensePeriod } from "@/components/freelancers/types";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(request: Request, context: RouteContext) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const { id } = await context.params;
  if (!isValidMongoId(id)) {
    return NextResponse.json({ error: "잘못된 프리랜서 ID입니다." }, { status: 400 });
  }
  const period = parsePeriod(new URL(request.url).searchParams.get("period"));

  if (!period) {
    return NextResponse.json({ error: "조회 기간이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const result = await listFreelancerExpenses(ctx, id, period);

    if (!result) {
      return NextResponse.json({ error: "프리랜서를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "프리랜서 지출 내역을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
