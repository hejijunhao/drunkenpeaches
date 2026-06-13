import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Fires a success toast when a `useActionState` action completes without error
 * (i.e. `pending` falls true → false and no `error` came back). Lets us add
 * consistent success feedback to forms that revalidate-in-place — without
 * touching the server actions (which is a plan non-goal).
 */
export function useSuccessToast(
  pending: boolean,
  error: string | undefined,
  message: string
) {
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !error) {
      toast.success(message);
    }
    wasPending.current = pending;
  }, [pending, error, message]);
}
