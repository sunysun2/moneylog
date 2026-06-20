import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, createAdminUser } from "@/models/User";
import {
  generateRecoveryKey,
  hashRecoveryKey,
} from "@/lib/crypto";

export async function GET() {
  try {
    await connectDB();
    const existing = await User.findOne();

    return NextResponse.json({
      isSetupComplete: Boolean(existing),
    });
  } catch {
    return NextResponse.json(
      { error: "설정 상태를 확인할 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await User.findOne();

    if (existing) {
      return NextResponse.json(
        { error: "이미 초기 설정이 완료되었습니다." },
        { status: 409 }
      );
    }

    const recoveryKey = generateRecoveryKey();
    const recoveryKeyHash = hashRecoveryKey(recoveryKey);

    await createAdminUser(password, recoveryKeyHash);

    return NextResponse.json({
      recoveryKey,
      message: "초기 설정이 완료되었습니다. 비상 복구 키를 안전한 곳에 보관하세요.",
    });
  } catch {
    return NextResponse.json(
      { error: "초기 설정에 실패했습니다." },
      { status: 500 }
    );
  }
}
