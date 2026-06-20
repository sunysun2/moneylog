export const NAV_ITEMS = [
  { href: "/youtube", label: "유튜브 계정", shortLabel: "유튜브", icon: "youtube" as const },
  { href: "/adsense", label: "애드센스 계정", shortLabel: "애드센스", icon: "adsense" as const },
  { href: "/phones", label: "휴대폰 관리", shortLabel: "휴대폰", icon: "phone" as const },
  { href: "/channels", label: "채널 관리", shortLabel: "채널", icon: "channels" as const },
  { href: "/finance", label: "수입 / 지출 관리", shortLabel: "장부", icon: "finance" as const },
  { href: "/dashboard", label: "통합 리포트", shortLabel: "리포트", icon: "dashboard" as const },
] as const;

export type NavIconName = (typeof NAV_ITEMS)[number]["icon"];
