"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  UtensilsIcon,
  WineIcon,
  EllipsisIcon,
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
import { BrandMark } from "@/components/brand-mark";

interface AppNavProps {
  clubSlug: string;
  clubName: string;
  memberName: string;
  isCommittee: boolean;
  isWineMaster: boolean;
}

/**
 * The club's masthead. Desktop: seal + club name, small-cap links, the member.
 * Phones: a bottom rail of four tabs and a "more" sheet.
 */
export function AppNav({
  clubSlug,
  clubName,
  memberName,
  isCommittee,
  isWineMaster,
}: AppNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const signoutRef = useRef<HTMLFormElement>(null);
  const base = `/c/${clubSlug}`;

  const primary = [
    { href: `${base}/dashboard`, label: "Home", icon: HomeIcon },
    { href: `${base}/lunches`, label: "Luncheons", icon: CalendarDaysIcon },
    { href: `${base}/members`, label: "Members", icon: UsersIcon },
  ];

  const moreLinks = [
    ...(isCommittee
      ? [{ href: `${base}/venues`, label: "Venues", icon: UtensilsIcon }]
      : []),
    ...(isCommittee || isWineMaster
      ? [{ href: `${base}/wine`, label: "Cellar", icon: WineIcon }]
      : []),
    ...(isCommittee
      ? [{ href: `${base}/settings`, label: "Settings", icon: SettingsIcon }]
      : []),
    { href: `${base}/profile`, label: "My particulars", icon: UserIcon },
  ];

  const desktopLinks = [
    ...primary,
    ...moreLinks.filter((l) => l.href !== `${base}/profile`),
  ];

  const isActive = (href: string) => pathname.startsWith(href);
  const moreActive = moreLinks.some((l) => isActive(l.href));

  const roleLabel = isWineMaster
    ? "Committee · Wine Master"
    : isCommittee
      ? "Committee"
      : "Member";

  const submitSignout = () => signoutRef.current?.requestSubmit();

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 md:h-[4.25rem] md:px-6">
          <Link
            href={`${base}/dashboard`}
            className="flex min-w-0 items-center gap-3"
          >
            <BrandMark size="sm" className="text-primary md:size-7" />
            <span className="font-heading truncate text-[1.05rem] leading-none tracking-[-0.01em] text-foreground md:text-[1.2rem]">
              {clubName}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Club">
            {desktopLinks.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[0.6875rem] font-medium tracking-[0.16em] uppercase transition-colors duration-(--duration-micro)",
                    active
                      ? "text-foreground after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:bg-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2.5 pr-2 pl-1.5"
                  />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback>{initials(memberName)}</AvatarFallback>
                </Avatar>
                <span className="max-w-36 truncate text-sm font-normal">
                  {memberName || "Account"}
                </span>
                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 pt-2 pb-2.5">
                  <p className="font-heading truncate text-[1.05rem] leading-tight text-foreground">
                    {memberName}
                  </p>
                  <p className="club-kicker mt-1.5 text-[0.625rem]">
                    {roleLabel}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={`${base}/profile`} />}>
                  <UserIcon />
                  My particulars
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={submitSignout}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="club-rule-double" />
      </header>

      {/* Phone rail */}
      <nav
        aria-label="Club"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
      >
        <ul className="grid h-16 grid-cols-4">
          {primary.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full min-h-11 flex-col items-center justify-center gap-1.5 text-[0.625rem] font-medium tracking-[0.14em] uppercase transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <l.icon
                    className="size-[1.15rem]"
                    strokeWidth={active ? 1.9 : 1.5}
                  />
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-label="More"
              onClick={() => setMoreOpen((o) => !o)}
              className={cn(
                "flex h-full min-h-11 w-full flex-col items-center justify-center gap-1.5 text-[0.625rem] font-medium tracking-[0.14em] uppercase transition-colors",
                moreOpen || moreActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {moreOpen ? (
                <XIcon className="size-[1.15rem]" strokeWidth={1.9} />
              ) : (
                <EllipsisIcon
                  className="size-[1.15rem]"
                  strokeWidth={moreActive ? 1.9 : 1.5}
                />
              )}
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-foreground/30 duration-(--duration-default) animate-in fade-in-0"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-16 border-t border-border bg-background px-5 pt-5 pb-3 shadow-lifted duration-(--duration-overlay) ease-(--ease-out-quint) animate-in slide-in-from-bottom-4 fade-in-0">
            <div className="flex items-center gap-3 pb-3">
              <Avatar size="sm">
                <AvatarFallback>{initials(memberName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-heading truncate text-[1.05rem] leading-tight">
                  {memberName}
                </p>
                <p className="club-kicker mt-1 text-[0.625rem]">{roleLabel}</p>
              </div>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {moreLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex min-h-12 items-center gap-3 text-[0.95rem]",
                    isActive(l.href)
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  <l.icon className="size-4 text-muted-foreground" />
                  {l.label}
                </Link>
              ))}
              <div className="flex min-h-12 items-center justify-between">
                <span className="text-[0.95rem]">Appearance</span>
                <ThemeToggle />
              </div>
            </div>
            <button
              type="button"
              onClick={submitSignout}
              className="flex min-h-12 w-full items-center gap-3 text-[0.95rem] text-destructive"
            >
              <LogOutIcon className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      <form ref={signoutRef} action="/auth/signout" method="post" hidden>
        <button type="submit" hidden aria-hidden tabIndex={-1} />
      </form>
    </>
  );
}
