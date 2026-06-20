"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      duration={2000}
      toastOptions={{
        classNames: {
          toast:
            "glass-panel !border !border-border-subtle !bg-bg-surface/80 !text-on-surface !shadow-none",
          success: "!text-primary",
          error: "!text-status-inactive",
          info: "!text-info",
        },
      }}
    />
  );
}
