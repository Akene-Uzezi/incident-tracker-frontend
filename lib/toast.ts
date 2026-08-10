import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

type ToastArgs = string | undefined;

export const notify = {
  success: (title: string, description?: ToastArgs) =>
    toast.success(title, description ? { description } : undefined),
  error: (title: string, description?: ToastArgs) =>
    toast.error(title, description ? { description } : undefined),
  info: (title: string, description?: ToastArgs) =>
    toast.info(title, description ? { description } : undefined),
  warning: (title: string, description?: ToastArgs) =>
    toast.warning(title, description ? { description } : undefined),
  /** Renders a concise title with the server-provided reason (if any) as the detail line. */
  apiError: (title: string, err: unknown) => {
    const description = err instanceof ApiError
      ? err.message
      : "Couldn't reach the server. Check your internet connection and try again.";
    toast.error(title, { description });
  },
};
