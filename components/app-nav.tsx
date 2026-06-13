"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
  WineIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const signoutRef = useRef<HTMLFormElement>(null);
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

  const isActive = (href: string) => pathname.startsWith(href);

  const roleLabel = isWineMaster
    ? "Committee · Wine master"
    : isCommittee
      ? "Committee"
      : "Member";

  const submitSignout = () => signoutRef.current?.requestSubmit();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Club lockup */}
          <Link
            href={`${base}/dashboard`}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-lg" aria-hidden>
              🍑
            </span>
            <span className="font-heading text-base font-medium tracking-tight">
              {clubName}
            </span>
          </Link>

          {/* Desktop primary nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors duration-(--duration-micro)",
                  isActive(l.href)
                    ? "bg-accent font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right cluster */}
          <div className="hidden items-center gap-1 md:flex">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="gap-2 pl-1.5" />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {initials(memberName)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-32 truncate">
                  {memberName || "Account"}
                </span>
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">{memberName}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {isWineMaster ? (
                      <WineIcon className="size-3 text-gold" />
                    ) : null}
                    {roleLabel}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={`${base}/profile`} />}>
                  <UserIcon />
                  My profile
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={submitSignout}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </Button>
        </div>

        {/* Mobile panel */}
        {open ? (
          <nav className="flex flex-col gap-1 pb-4 duration-(--duration-default) ease-(--ease-out-quint) animate-in fade-in-0 slide-in-from-top-2 md:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm transition-colors",
                  isActive(l.href)
                    ? "bg-accent font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}

            <DropdownMenuSeparatorRow />

            <Link
              href={`${base}/profile`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials(memberName)}
                </AvatarFallback>
              </Avatar>
              <span className="flex flex-col">
                <span className="font-medium text-foreground">
                  {memberName}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  {isWineMaster ? (
                    <WineIcon className="size-3 text-gold" />
                  ) : null}
                  {roleLabel}
                </span>
              </span>
            </Link>

            <div className="flex items-center justify-between rounded-lg px-3 py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>

            <div className="px-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={submitSignout}
              >
                <LogOutIcon />
                Sign out
              </Button>
            </div>
          </nav>
        ) : null}
      </div>

      {/* Sign-out POST form, submitted by the menu items above. */}
      <form ref={signoutRef} action="/auth/signout" method="post" hidden>
        <button type="submit" hidden aria-hidden tabIndex={-1} />
      </form>
    </header>
  );
}

/** Thin divider used inside the mobile panel. */
function DropdownMenuSeparatorRow() {
  return <div className="my-1 h-px bg-border" />;
}
