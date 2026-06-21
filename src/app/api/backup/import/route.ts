import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { verifyMasterPassword } from "@/lib/backup-auth";
import { decryptBackupPayload } from "@/lib/backup-crypto";
import { importBackupData, parseBackupPayload } from "@/lib/backup-service";

export async function POST(request: Request) {
  const { ctx, session, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  const formData = await request.formData();
  const file = formData.get("file");
  const password = String(formData.get("password") ?? "").trim();
  const confirm = formData.get("confirm") === "true";

  if (!confirm) {
    return NextResponse.json(
      { error: "?? ?? ? ??? ???." },
      { status: 400 }
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "?? ??? ??? ???." }, { status: 400 });
  }

  const verification = await verifyMasterPassword(session!.user.id, password);
  if (!verification.ok) {
    return NextResponse.json(
      { error: "??? ????? ???? ????." },
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
            "?? ??? ? ? ????. ??? ????? ???, ??? ???? ???? ??? ???.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "?? ??? ?? ? ????." }, { status: 400 });
  }

  let payload;
  try {
    payload = parseBackupPayload(decryptedJson);
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "UNSUPPORTED_BACKUP") {
      return NextResponse.json(
        { error: "???? ?? ?? ?? ?????." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "?? ??? ??? ???? ????." }, { status: 400 });
  }

  try {
    const counts = await importBackupData(ctx, payload);
    return NextResponse.json({ success: true, counts });
  } catch (err) {
    console.error(err);
    const code = err instanceof Error ? err.message : "";
    if (code === "IMPORT_FAILED_AND_RESTORE_FAILED") {
      return NextResponse.json(
        {
          error:
            "??? ??? ????? ?? ???? ????? ?????. ?? ??? ?? ??? ???.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "??? ?? ? ??? ??????. ?? ??? ?? ??? ???." },
      { status: 500 }
    );
  }
}
