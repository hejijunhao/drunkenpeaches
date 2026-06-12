"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppNavProps {
  clubSlug: string;
  clubName: string;
  memberName: string;
  isCommittee: boolean;
  isWineMaster: boolean;
}

export function AppNav({
  clubSlug,
  clubName,
  memberName,
  isCommittee,
  isWineMaster,
}: AppNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/c/${clubSlug}`;

  const links = [
    { href: `${base}/dashboard`, label: "Dashboard" },
    { href: `${base}/lunches`, label: "Lunches" },
    { href: `${base}/members`, label: "Members" },
    ...(isCommittee ? [{ href: `${base}/venues`, label: "Venues" }] : []),
    ...(isCommittee || isWineMaster
      ? [{ href: `${base}/wine`, label: "Wine" }]
      : []),
    ...(isCommittee ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];

  const linkEls = links.map((l) => (
    <Link
      key={l.href}
      href={l.href}
      onClick={() => setOpen(false)}
      className={cn(
        "rounded-md px-3 py-2 text-sm transition-colors hover:bg-stone-100",
        pathname.startsWith(l.href)
          ? "font-medium text-stone-900 bg-stone-100"
          : "text-stone-600"
      )}
    >
      {l.label}
    </Link>
  ));

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href={`${base}/dashboard`}
            className="font-semibold tracking-tight whitespace-nowrap"
          >
            🍑 <span className="hidden sm:inline">{clubName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">{linkEls}</nav>
          <div className="hidden md:flex items-center gap-2">
            <Link
              href={`${base}/profile`}
              className="text-sm text-stone-600 hover:text-stone-900"
            >
              {memberName || "Profile"}
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
          <button
            className="md:hidden p-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <nav className="md:hidden flex flex-col gap-1 pb-4">
            {linkEls}
            <Link
              href={`${base}/profile`}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
            >
              My profile
            </Link>
            <form action="/auth/signout" method="post" className="px-3 pt-2">
              <Button variant="outline" size="sm" type="submit" className="w-full">
                Sign out
              </Button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
