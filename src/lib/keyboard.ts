const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function canUseGlobalShortcut(): boolean {
  if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
    return false;
  }

  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) {
    return true;
  }

  if (!(el instanceof HTMLElement)) {
    return true;
  }

  if (el.isContentEditable) {
    return false;
  }

  if (TYPING_TAGS.has(el.tagName)) {
    return false;
  }

  const role = el.getAttribute("role");
  if (role === "textbox" || role === "combobox" || role === "searchbox") {
    return false;
  }

  return true;
}
