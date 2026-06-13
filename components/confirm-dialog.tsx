"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  /** Controlled open state. Omit (and pass `trigger`) for uncontrolled use. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional trigger element (uncontrolled). e.g. `<Button>Delete</Button>`. */
  trigger?: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red-toned confirm button + intent for destructive actions. */
  destructive?: boolean;
  /** Show a spinner on the confirm button and block close. */
  loading?: boolean;
  onConfirm?: () => void | Promise<void>;
}

/**
 * Branded confirmation modal — the replacement for `window.confirm()`.
 *
 * Two modes:
 *  - Uncontrolled: pass `trigger`; the dialog manages its own open state.
 *  - Controlled: pass `open` + `onOpenChange` (used by `ConfirmSubmit` to gate a
 *    server-action form submit).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={loading} />}
          >
            {cancelLabel}
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            loading={loading}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
