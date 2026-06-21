"use client";

import { cn } from "@/lib/cn";
import { convertHangulToQwerty } from "@/lib/hangul-to-qwerty";
import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { notify } from "@/lib/notify";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  copyable?: boolean;
  sensitive?: boolean;
  showToggle?: boolean;
  convertHangulToQwerty?: boolean;
  error?: string;
}

export function Input({
  label,
  copyable = false,
  sensitive = false,
  showToggle = false,
  convertHangulToQwerty: shouldConvertHangul = false,
  error,
  className,
  id,
  value,
  type = "text",
  onChange,
  lang,
  autoCapitalize,
  autoCorrect,
  spellCheck,
  onCompositionStart,
  onCompositionEnd,
  ...props
}: InputProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const isComposingRef = useRef(false);
  const inputId = id ?? label?.replace(/\s/g, "-").toLowerCase();

  const isPasswordField = type === "password" || showToggle;
  const inputType = isPasswordField ? (visible ? "text" : "password") : type;

  function emitChange(event: ChangeEvent<HTMLInputElement>, nextValue: string) {
    if (!onChange) return;

    if (nextValue === event.target.value) {
      onChange(event);
      return;
    }

    onChange({
      ...event,
      target: { ...event.target, value: nextValue },
      currentTarget: { ...event.currentTarget, value: nextValue },
    });
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!onChange) return;

    if (!shouldConvertHangul || isComposingRef.current) {
      onChange(event);
      return;
    }

    emitChange(event, convertHangulToQwerty(event.target.value));
  }

  function handleCompositionEnd(event: React.CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = false;
    onCompositionEnd?.(event);

    if (!shouldConvertHangul || !onChange) return;

    emitChange(
      event as unknown as ChangeEvent<HTMLInputElement>,
      convertHangulToQwerty(event.currentTarget.value)
    );
  }

  function handleCompositionStart(event: React.CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = true;
    onCompositionStart?.(event);
  }

  async function handleCopy() {
    const text = String(value ?? "");
    if (!text) return;
    await navigator.clipboard.writeText(text);
    notify.success("클립보드에 복사되었습니다.");
  }

  const hasRightAction = (copyable && sensitive) || isPasswordField;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-label-caps text-on-surface-variant">
          {label}
        </label>
      )}
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          {...props}
          id={inputId}
          type={inputType}
          value={value}
          lang={shouldConvertHangul ? "en" : lang}
          autoCapitalize={shouldConvertHangul ? "off" : autoCapitalize}
          autoCorrect={shouldConvertHangul ? "off" : autoCorrect}
          spellCheck={shouldConvertHangul ? false : spellCheck}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={cn(
            "w-full rounded-lg border border-border-subtle bg-surface-container-lowest px-3 py-2.5 text-body-sm text-text-primary outline-none transition focus-ring-primary",
            sensitive && "font-data-mono",
            hasRightAction && "pr-20",
            className
          )}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="rounded-md border border-border-subtle bg-surface-container-high px-2 py-1 text-xs text-on-surface-variant hover:text-text-primary"
              aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
            >
              {visible ? "숨김" : "표시"}
            </button>
          )}
          {copyable && sensitive && isHovered && (
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-border-subtle bg-surface-container-high px-2 py-1 text-xs text-on-surface-variant hover:text-text-primary"
              aria-label="복사"
            >
              Copy
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-body-sm text-status-inactive">{error}</p>}
    </div>
  );
}
