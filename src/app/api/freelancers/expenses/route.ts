import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
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
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const period = parsePeriod(new URL(request.url).searchParams.get("period"));

  if (!period) {
    return NextResponse.json({ error: "?? ??? ???? ????." }, { status: 400 });
  }

  try {
    const result = await listAllFreelancerExpenses(ctx, period);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "???? ?? ??? ???? ?????." },
      { status: 500 }
    );
  }
}
