"use client";

import { signOut } from "next-auth/react";
import { useSearchStore } from "@/stores/searchStore";
import { SearchBar } from "./SearchBar";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { query, setQuery } = useSearchStore();

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center gap-4 bg-bg-base px-4 md:px-6">
      <div className="hidden flex-1 justify-center md:flex">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="ml-auto flex w-full items-center justify-end gap-2 md:w-auto">
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="!px-3 !py-2"
        >
          로그아웃
        </Button>
      </div>
    </header>
  );
}
