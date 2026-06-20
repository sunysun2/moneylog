"use client";

import { Sidebar, MobileBottomNav } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/cn";
import { useNavKeyboardShortcuts } from "@/hooks/useNavKeyboardShortcuts";

export function AppShell({ children }: { children: React.ReactNode }) {
  useNavKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen pb-20 md:ml-[var(--sidebar-rail-width)] md:pb-0 lg:ml-[var(--sidebar-width)]"
        )}
      >
        <Header />
        <main
          className={cn(
            "mx-auto max-w-[var(--container-max)] p-[var(--gutter-mobile)] md:p-[var(--gutter)]"
          )}
        >
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
