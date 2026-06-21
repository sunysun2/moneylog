import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { verifyMasterPassword } from "@/lib/backup-auth";
import { encryptBackupPayload } from "@/lib/backup-crypto";
import { exportBackupData } from "@/lib/backup-service";

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const password = String(body.password ?? "").trim();
  const verification = await verifyMasterPassword(password);
  if (!verification.ok) {
    return NextResponse.json(
      { error: "마스터 비밀번호가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  try {
    const payload = await exportBackupData();
    const encrypted = encryptBackupPayload(JSON.stringify(payload), password);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `moneylog-backup-${date}.moneylog`;

    return new NextResponse(encrypted, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "백업 파일 생성에 실패했습니다." }, { status: 500 });
  }
}
