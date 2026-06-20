import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword, hashRecoveryKey } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const { recoveryKey, newPassword } = await request.json();

    if (!recoveryKey || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "복구 키와 새 비밀번호(8자 이상)가 필요합니다." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne();

    if (!user) {
      return NextResponse.json(
        { error: "등록된 사용자가 없습니다." },
        { status: 404 }
      );
    }

    const inputHash = hashRecoveryKey(recoveryKey);

    if (inputHash !== user.recoveryKeyHash) {
      return NextResponse.json(
        { error: "비상 복구 키가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({ message: "비밀번호가 재설정되었습니다." });
  } catch {
    return NextResponse.json(
      { error: "비밀번호 재설정에 실패했습니다." },
      { status: 500 }
    );
  }
}
