"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NAV_ITEMS } from "@/config/navigation";
import { NavIcon } from "@/components/icons/NavIcon";
import { FinanceQuickActions } from "./FinanceQuickActions";
import { cn } from "@/lib/cn";

function useVisibleNavItems() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return NAV_ITEMS.filter((item) => {
    if ("adminOnly" in item && item.adminOnly) {
      return isAdmin;
    }
    return true;
  });
}

function NavLink({
  href,
  label,
  icon,
  isActive,
  compact = false,
}: {
  href: string;
  label: string;
  icon: (typeof NAV_ITEMS)[number]["icon"];
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "flex items-center rounded-lg text-body-sm font-medium transition-colors",
        compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
        isActive
          ? "border-l-2 border-l-primary-container bg-primary/10 text-primary"
          : "border-l-2 border-l-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-text-primary"
      )}
    >
      <NavIcon name={icon} />
      {!compact && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const navItems = useVisibleNavItems();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[var(--sidebar-width)] flex-col bg-bg-surface lg:flex">
        <div className="flex h-[var(--header-height)] items-center px-6">
          <Link
            href="/dashboard"
            className="text-[36px] font-bold tracking-tight text-primary-container"
          >
            MoneyLog
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </nav>
        <div className="shrink-0 pb-8">
          <FinanceQuickActions />
        </div>
      </aside>

      {/* Tablet icon rail */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[var(--sidebar-rail-width)] flex-col bg-bg-surface md:flex lg:hidden">
        <div className="flex h-[var(--header-height)] items-center justify-center">
          <Link
            href="/dashboard"
            className="text-lg font-bold text-primary-container"
            aria-label="MoneyLog"
          >
            M
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
              compact
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const navItems = useVisibleNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-bg-base px-2 py-2 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px]",
              isActive ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <NavIcon name={item.icon} className="h-4 w-4" />
            <span>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
