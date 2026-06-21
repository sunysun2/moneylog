import { NextResponse } from "next/server";
import { requireOwnerContext } from "@/lib/api-auth";
import { verifyMasterPassword } from "@/lib/backup-auth";
import { encryptBackupPayload } from "@/lib/backup-crypto";
import { exportBackupData } from "@/lib/backup-service";

export async function POST(request: Request) {
  const { ctx, session, error } = await requireOwnerContext();
  if (error || !ctx) return error!;

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "?? ??? ???? ????." }, { status: 400 });
  }

  const password = String(body.password ?? "").trim();
  const verification = await verifyMasterPassword(session!.user.id, password);
  if (!verification.ok) {
    return NextResponse.json(
      { error: "??? ????? ???? ????." },
      { status: 400 }
    );
  }

  try {
    const payload = await exportBackupData(ctx);
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
    return NextResponse.json({ error: "?? ?? ??? ??????." }, { status: 500 });
  }
}
