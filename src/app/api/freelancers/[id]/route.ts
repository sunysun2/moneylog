import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { isValidMongoId } from "@/lib/mongodb-id";
import { deleteFreelancer, updateFreelancer } from "@/lib/freelancer-service";

type RouteContext = { params: Promise<{ id: string }> };

function invalidIdResponse() {
  return NextResponse.json({ error: "잘못된 프리랜서 ID입니다." }, { status: 400 });
}

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;
  if (!isValidMongoId(id)) return invalidIdResponse();

  try {
    const body = await request.json();

    if (body.name != null && !String(body.name).trim()) {
      return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });
    }

    const freelancer = await updateFreelancer(id, body);

    if (!freelancer) {
      return NextResponse.json({ error: "프리랜서를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(freelancer);
  } catch {
    return NextResponse.json(
      { error: "프리랜서를 수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;
  if (!isValidMongoId(id)) return invalidIdResponse();

  try {
    const deleted = await deleteFreelancer(id);
    if (!deleted) {
      return NextResponse.json({ error: "프리랜서를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "프리랜서를 삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
