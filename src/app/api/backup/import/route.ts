import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { verifyMasterPassword } from "@/lib/backup-auth";
import { decryptBackupPayload } from "@/lib/backup-crypto";
import { importBackupData, parseBackupPayload } from "@/lib/backup-service";

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const formData = await request.formData();
  const file = formData.get("file");
  const password = String(formData.get("password") ?? "").trim();
  const confirm = formData.get("confirm") === "true";

  if (!confirm) {
    return NextResponse.json(
      { error: "복원 확인 후 진행해 주세요." },
      { status: 400 }
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "백업 파일을 선택해 주세요." }, { status: 400 });
  }

  const verification = await verifyMasterPassword(password);
  if (!verification.ok) {
    return NextResponse.json(
      { error: "마스터 비밀번호가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  let decryptedJson: string;
  try {
    const envelopeText = await file.text();
    decryptedJson = decryptBackupPayload(envelopeText, password);
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "DECRYPT_FAILED" || code === "INVALID_ENVELOPE") {
      return NextResponse.json(
        {
          error:
            "백업 파일을 열 수 없습니다. 마스터 비밀번호가 맞는지, 파일이 손상되지 않았는지 확인해 주세요.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "백업 파일을 읽을 수 없습니다." }, { status: 400 });
  }

  let payload;
  try {
    payload = parseBackupPayload(decryptedJson);
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "UNSUPPORTED_BACKUP") {
      return NextResponse.json(
        { error: "지원하지 않는 백업 파일 형식입니다." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "백업 데이터 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const counts = await importBackupData(payload);
    return NextResponse.json({ success: true, counts });
  } catch (err) {
    console.error(err);
    const code = err instanceof Error ? err.message : "";
    if (code === "IMPORT_FAILED_AND_RESTORE_FAILED") {
      return NextResponse.json(
        {
          error:
            "데이터 복원에 실패했으며 이전 데이터로 되돌리지도 못했습니다. 백업 파일로 다시 시도해 주세요.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "데이터 복원 중 오류가 발생했습니다. 백업 파일로 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
