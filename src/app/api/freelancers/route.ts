import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { createFreelancer, listFreelancers } from "@/lib/freelancer-service";

export async function GET() {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const freelancers = await listFreelancers(ctx);
    return NextResponse.json(freelancers);
  } catch {
    return NextResponse.json(
      { error: "???? ??? ???? ?????." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { ctx, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  try {
    const body = await request.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "??? ?????." }, { status: 400 });
    }

    const freelancer = await createFreelancer(ctx, body);
    return NextResponse.json(freelancer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "????? ???? ?????." },
      { status: 500 }
    );
  }
}
