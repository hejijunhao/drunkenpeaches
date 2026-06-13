import * as React from "react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

interface AuthShellProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Links / helper copy under the form (e.g. "Forgot password?"). */
  footer?: React.ReactNode;
}

/**
 * Shared, branded layout for every auth screen (login / signup / forgot /
 * reset / set-password): a centered form column on the parchment canvas with a
 * wordmark + theme toggle, and a burgundy editorial side panel on desktop.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-dvh flex-1">
      {/* Form column */}
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 whitespace-nowrap"
            aria-label="Drunken Peaches home"
          >
            <span className="text-lg" aria-hidden>
              🍑
            </span>
            <span className="font-heading text-base font-medium tracking-tight">
              Drunken Peaches
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-h1 text-foreground">{title}</h1>
            {description ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Brand panel (desktop) */}
      <aside className="relative hidden w-[42%] max-w-xl flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-black/20 blur-3xl"
        />
        <div className="relative flex items-center gap-2 text-sm tracking-wide text-primary-foreground/70">
          <span aria-hidden>🍑</span>
          For private dining clubs
        </div>
        <blockquote className="relative">
          <p className="font-heading text-3xl leading-tight font-medium text-balance">
            A society of friends, a serious cellar, and a standing
            reservation.
          </p>
          <footer className="mt-6 text-sm text-primary-foreground/70">
            Lunches, sign-ups, waitlists, venues and wine — handled, so the
            committee can get back to the table.
          </footer>
        </blockquote>
        <div className="relative text-xs text-primary-foreground/60">
          Every club is its own private, isolated tenant.
        </div>
      </aside>
    </main>
  );
}
