import { toast } from "sonner";

const TOAST_DURATION = 2000;

export const notify = {
  success: (message: string) => toast.success(message, { duration: TOAST_DURATION }),
  error: (message: string) => toast.error(message, { duration: TOAST_DURATION }),
  info: (message: string) => toast.info(message, { duration: TOAST_DURATION }),
  currency: (message: string) =>
    toast.info(message, {
      duration: TOAST_DURATION,
      className: "!text-info",
    }),
};
