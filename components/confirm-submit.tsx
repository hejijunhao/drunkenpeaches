"use client";

import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

interface ConfirmSubmitProps extends ComponentProps<typeof Button> {
  confirmMessage: string;
}

/** Submit button that asks for confirmation — for destructive form actions. */
export function ConfirmSubmit({
  confirmMessage,
  ...props
}: ConfirmSubmitProps) {
  return (
    <Button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      {...props}
    />
  );
}
