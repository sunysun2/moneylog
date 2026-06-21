"use client";

import { useRef, useState } from "react";
import { Button, Input, Modal, ModalActions } from "@/components/ui";
import { notify } from "@/lib/notify";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseFilename(contentDisposition: string | null): string {
  if (!contentDisposition) return "moneylog-backup.moneylog";
  const match = contentDisposition.match(/filename="([^"]+)"/);
  return match?.[1] ?? "moneylog-backup.moneylog";
}

export function HeaderBackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [loadPassword, setLoadPassword] = useState("");
  const [loadFile, setLoadFile] = useState<File | null>(null);
  const [loadConfirmed, setLoadConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  function resetSaveModal() {
    setMasterPassword("");
    setSaveOpen(false);
  }

  function resetLoadModal() {
    setLoadPassword("");
    setLoadFile(null);
    setLoadConfirmed(false);
    setLoadOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (masterPassword.trim().length < 8) {
      notify.error("마스터 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/backup/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: masterPassword }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        notify.error(data?.error ?? "백업 파일 생성에 실패했습니다.");
        return;
      }

      const blob = await response.blob();
      const filename = parseFilename(response.headers.get("Content-Disposition"));
      downloadBlob(blob, filename);
      notify.success("백업 파일을 저장했습니다.");
      resetSaveModal();
    } catch {
      notify.error("백업 파일 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoad() {
    if (!loadFile) {
      notify.error("백업 파일을 선택해 주세요.");
      return;
    }
    if (loadPassword.trim().length < 8) {
      notify.error("마스터 비밀번호를 입력해 주세요.");
      return;
    }
    if (!loadConfirmed) {
      notify.error("복원 확인 후 진행해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", loadFile);
      formData.append("password", loadPassword);
      formData.append("confirm", "true");

      const response = await fetch("/api/backup/import", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; success?: boolean }
        | null;

      if (!response.ok) {
        notify.error(data?.error ?? "데이터 복원에 실패했습니다.");
        return;
      }

      notify.success("데이터를 복원했습니다. 페이지를 새로고침합니다.");
      resetLoadModal();
      window.setTimeout(() => window.location.reload(), 800);
    } catch {
      notify.error("데이터 복원에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setSaveOpen(true)}
        className="!px-3 !py-2"
      >
        저장
      </Button>
      <Button
        variant="secondary"
        onClick={() => setLoadOpen(true)}
        className="!px-3 !py-2"
      >
        불러오기
      </Button>

      <Modal
        open={saveOpen}
        onClose={resetSaveModal}
        title="데이터 백업"
        footer={
          <ModalActions
            onCancel={resetSaveModal}
            onConfirm={handleSave}
            confirmLabel="내보내기"
            loading={loading}
          />
        }
      >
        <div className="space-y-4 text-body-sm text-on-surface-variant">
          <p>
            모든 데이터를 마스터 비밀번호로 암호화한 뒤{" "}
            <strong className="text-text-primary">.moneylog</strong> 파일로 저장합니다. 로그인에
            사용하는 비밀번호와 동일합니다.
          </p>
          <Input
            label="마스터 비밀번호"
            type="password"
            showToggle
            convertHangulToQwerty
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="로그인 비밀번호"
          />
        </div>
      </Modal>

      <Modal
        open={loadOpen}
        onClose={resetLoadModal}
        title="데이터 복원"
        footer={
          <ModalActions
            onCancel={resetLoadModal}
            onConfirm={handleLoad}
            confirmLabel="복원"
            loading={loading}
          />
        }
      >
        <div className="space-y-4 text-body-sm text-on-surface-variant">
          <p>
            백업 파일의 데이터로 <strong className="text-text-primary">현재 DB의 모든 데이터</strong>
            를 교체합니다. 복원 전에 최신 백업을 먼저 저장해 두는 것을 권장합니다.
          </p>
          <div className="space-y-1.5">
            <label className="text-label-caps text-on-surface-variant">백업 파일</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".moneylog,application/json"
              onChange={(e) => setLoadFile(e.target.files?.[0] ?? null)}
              className="block w-full text-body-sm text-text-primary file:mr-3 file:rounded-lg file:border file:border-border-subtle file:bg-surface-container-lowest file:px-3 file:py-2 file:text-body-sm file:text-text-primary"
            />
          </div>
          <Input
            label="마스터 비밀번호"
            type="password"
            showToggle
            convertHangulToQwerty
            value={loadPassword}
            onChange={(e) => setLoadPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="로그인 비밀번호"
          />
          <label className="flex items-start gap-2 rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5">
            <input
              type="checkbox"
              checked={loadConfirmed}
              onChange={(e) => setLoadConfirmed(e.target.checked)}
              className="mt-0.5"
            />
            <span>기존 데이터가 모두 삭제되고 백업 데이터로 교체됨을 확인했습니다.</span>
          </label>
        </div>
      </Modal>
    </>
  );
}
