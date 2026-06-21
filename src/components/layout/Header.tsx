"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSearchStore } from "@/stores/searchStore";
import { SearchBar } from "./SearchBar";
import { HeaderBackupControls } from "./HeaderBackupControls";
import { Button } from "@/components/ui/Button";

const HIDE_HEADER_SEARCH_PATHS = ["/finance", "/dashboard"];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery } = useSearchStore();
  const showSearch = !HIDE_HEADER_SEARCH_PATHS.includes(pathname);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center gap-4 bg-bg-base px-4 md:px-6">
      {showSearch && (
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      )}

      <div className="ml-auto flex w-full items-center justify-end gap-2 md:w-auto">
        <HeaderBackupControls />
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          disabled={loggingOut}
          className="!px-3 !py-2"
        >
          {loggingOut ? "로그아웃 중..." : "로그아웃"}
        </Button>
      </div>
    </header>
  );
}
