"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NAV_SHORTCUT_BY_KEY } from "@/config/navigation";
import { dispatchFinanceQuickAction } from "@/lib/finance-quick-actions";
import { canUseGlobalShortcut } from "@/lib/keyboard";

export function useNavKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!canUseGlobalShortcut()) return;

      if (e.key === "9") {
        e.preventDefault();
        dispatchFinanceQuickAction("income");
        return;
      }

      if (e.key === "0") {
        e.preventDefault();
        dispatchFinanceQuickAction("expense");
        return;
      }

      const href = NAV_SHORTCUT_BY_KEY[e.key as keyof typeof NAV_SHORTCUT_BY_KEY];
      if (!href) return;

      e.preventDefault();
      router.push(href);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);
}
