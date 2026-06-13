"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface ConfirmSubmitProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick" | "type"> {
  /** Body copy shown in the confirm modal. */
  confirmMessage: string;
  /** Modal heading (defaults to a generic prompt). */
  confirmTitle?: string;
  /** Confirm button label (defaults to the trigger's text). */
  confirmLabel?: string;
}

/**
 * Submit button that gates a server-action `<form>` behind a branded
 * confirmation modal — the replacement for `window.confirm()`.
 *
 * Renders an ordinary (type="button") trigger; on confirm it locates the host
 * form and calls `requestSubmit()`, so the existing `<form action={…}>`
 * server-action ergonomics are untouched.
 */
export function ConfirmSubmit({
  confirmMessage,
  confirmTitle = "Please confirm",
  confirmLabel,
  variant = "default",
  children,
  ...props
}: ConfirmSubmitProps) {
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  const handleOpen: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    formRef.current = event.currentTarget.form;
    setOpen(true);
  };

  return (
    <>
      <Button type="button" variant={variant} onClick={handleOpen} {...props}>
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={confirmTitle}
        description={confirmMessage}
        confirmLabel={
          confirmLabel ?? (typeof children === "string" ? children : "Confirm")
        }
        destructive={variant === "destructive"}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
