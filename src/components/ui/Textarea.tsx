import { cn } from "@/lib/cn";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.replace(/\s/g, "-").toLowerCase();

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-label-caps text-on-surface-variant">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-[88px] w-full resize-y rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5 text-body-sm text-text-primary outline-none transition focus-ring-primary",
          className
        )}
        {...props}
      />
    </div>
  );
}
