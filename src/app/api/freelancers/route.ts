import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { createFreelancer, listFreelancers } from "@/lib/freelancer-service";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const freelancers = await listFreelancers();
    return NextResponse.json(freelancers);
  } catch {
    return NextResponse.json(
      { error: "프리랜서 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const body = await request.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });
    }

    const freelancer = await createFreelancer(body);
    return NextResponse.json(freelancer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "프리랜서를 추가하지 못했습니다." },
      { status: 500 }
    );
  }
}
