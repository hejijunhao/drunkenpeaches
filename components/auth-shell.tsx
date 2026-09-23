import * as React from "react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark, BrandWordmark } from "@/components/brand-mark";

interface AuthShellProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Links / helper copy under the form. */
  footer?: React.ReactNode;
}

/**
 * The entrance: a form column on cream; on wide screens, an oxblood panel with
 * the seal and a line from the minutes.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-dvh flex-1">
      <div className="flex flex-1 flex-col px-5 py-5 sm:px-10 sm:py-7">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Drunken Peaches home">
            <BrandWordmark size="sm" />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <p className="club-kicker">Drunken Peaches</p>
            <h1 className="text-h1 mt-4 text-balance text-foreground">{title}</h1>
            {description ? (
              <p className="mt-3 text-[0.95rem] leading-relaxed text-pretty text-muted-foreground">
                {description}
              </p>
            ) : null}
            <div className="club-rule mt-7 w-10 bg-foreground/50" />
            <div className="mt-7">{children}</div>
            {footer ? (
              <div className="mt-8 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </div>

        <p className="club-kicker text-[0.625rem]">Each club is its own private chapter.</p>
      </div>

      <aside className="relative hidden w-[42%] max-w-2xl flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-5 border border-primary-foreground/20"
        />
        <BrandMark size="lg" className="relative text-primary-foreground/90" />
        <blockquote className="relative max-w-md">
          <p className="text-aside text-[2.15rem] leading-[1.15] text-balance">
            A society of friends, a serious cellar, and a standing reservation.
          </p>
          <footer className="mt-7 text-sm leading-relaxed text-primary-foreground/70">
            The list, the venues, the wine — kept so the committee may return to
            the table.
          </footer>
        </blockquote>
        <div className="relative flex items-center justify-between text-[0.625rem] font-medium tracking-[0.18em] text-primary-foreground/60 uppercase">
          <span>Drunken Peaches</span>
          <span>By invitation</span>
        </div>
      </aside>
    </main>
  );
}
