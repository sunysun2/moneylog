export const NAV_ITEMS = [
  {
    href: "/youtube",
    label: "유튜브 계정",
    shortLabel: "유튜브",
    icon: "youtube" as const,
    shortcutKey: "1",
  },
  {
    href: "/adsense",
    label: "애드센스 계정",
    shortLabel: "애드센스",
    icon: "adsense" as const,
    shortcutKey: "2",
  },
  {
    href: "/phones",
    label: "휴대폰 관리",
    shortLabel: "휴대폰",
    icon: "phone" as const,
    shortcutKey: "3",
  },
  {
    href: "/channels",
    label: "채널 관리",
    shortLabel: "채널",
    icon: "channels" as const,
    shortcutKey: "4",
  },
  {
    href: "/freelancers",
    label: "프리랜서 관리",
    shortLabel: "프리랜서",
    icon: "freelancer" as const,
    shortcutKey: "5",
  },
  {
    href: "/finance",
    label: "수입 / 지출 관리",
    shortLabel: "장부",
    icon: "finance" as const,
    shortcutKey: "6",
  },
  {
    href: "/dashboard",
    label: "통합 리포트",
    shortLabel: "리포트",
    icon: "dashboard" as const,
    shortcutKey: "7",
  },
  {
    href: "/settings/email",
    label: "이메일 리포트",
    shortLabel: "이메일",
    icon: "email" as const,
    shortcutKey: "8",
    adminOnly: true,
  },
  {
    href: "/admin/signups",
    label: "가입 승인",
    shortLabel: "승인",
    icon: "admin" as const,
    shortcutKey: "9",
    adminOnly: true,
  },
  {
    href: "/admin/members",
    label: "회원 탈퇴",
    shortLabel: "탈퇴",
    icon: "members" as const,
    adminOnly: true,
  },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export type NavIconName = (typeof NAV_ITEMS)[number]["icon"];

export const NAV_SHORTCUT_BY_KEY = Object.fromEntries(
  NAV_ITEMS.flatMap((item) =>
    "shortcutKey" in item ? [[item.shortcutKey, item.href] as const] : []
  )
) as Record<string, string>;
