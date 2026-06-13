import { toast } from "sonner";

/**
 * Thin toast helper layered over sonner (mounted in `app/layout.tsx`).
 *
 * Use these instead of inline "Saved ✓" text or silent successes so feedback is
 * consistent everywhere. `toast` is re-exported for the occasional advanced case
 * (promise toasts, custom durations, actions).
 */
export { toast };

export function toastSuccess(message: string, description?: string) {
  return toast.success(message, description ? { description } : undefined);
}

export function toastError(message: string, description?: string) {
  return toast.error(message, description ? { description } : undefined);
}

export function toastInfo(message: string, description?: string) {
  return toast(message, description ? { description } : undefined);
}
