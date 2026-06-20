import { cn } from "@/lib/cn";
import type { ContentFormat } from "@/models/Channel";

export const CONTENT_FORMAT_BUTTON_BASE =
  "inline-flex items-center justify-center rounded-lg text-body-sm font-semibold";

const CONTENT_FORMAT_MID_BUTTON_CLASS =
  "bg-[color-mix(in_oklab,var(--color-primary-container)_50%,#ef467e_50%)] text-white";

export function getContentFormatButtonClassName(format: ContentFormat): string {
  if (format === "short") {
    return "bg-primary-container text-text-primary glow-primary";
  }
  if (format === "mid") {
    return CONTENT_FORMAT_MID_BUTTON_CLASS;
  }
  return "bg-[#ef467e] text-white";
}

export function contentFormatLabel(format?: ContentFormat): string {
  if (format === "short") return "숏폼";
  if (format === "mid") return "미드폼";
  if (format === "long") return "롱폼";
  return "—";
}

interface ContentFormatBadgeProps {
  format?: ContentFormat;
  size?: "sm" | "md";
}

export function ContentFormatBadge({ format, size = "md" }: ContentFormatBadgeProps) {
  if (!format) {
    return <span className="text-on-surface-variant">—</span>;
  }

  return (
    <span
      className={cn(
        CONTENT_FORMAT_BUTTON_BASE,
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5",
        getContentFormatButtonClassName(format)
      )}
    >
      {contentFormatLabel(format)}
    </span>
  );
}
