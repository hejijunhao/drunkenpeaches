import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark, BrandWordmark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/server";
import { getMyClubs } from "@/lib/club-context";

const NOTICES = [
  {
    numeral: "I",
    kicker: "The list",
    title: "Fixed places, in order of name",
    body: "Capacity is the restaurant booking, nothing more. Members add their names first-come; the rest wait, and a place is offered the moment one is free.",
  },
  {
    numeral: "II",
    kicker: "The committee",
    title: "The secretary’s desk",
    body: "Venues from candidate to tasting to table. Dietary notes for the house. A quiet override when a member telephones instead.",
  },
  {
    numeral: "III",
    kicker: "The cellar",
    title: "Wine, recorded discreetly",
    body: "The Wine Master keeps a short cellar and notes the pairing. Members see none of it until they sit down.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const clubs = await getMyClubs();
    if (clubs.length > 0) redirect(`/c/${clubs[0].slug}/dashboard`);
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6">
          <BrandWordmark size="sm" />
          <nav className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Members
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Establish a chapter
            </Button>
          </nav>
        </div>
        <div className="club-rule-double" />
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-24 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <p className="club-kicker">Private dining clubs · Est. MMXXVI</p>
            <h1 className="text-display mt-6 text-balance text-foreground">
              The book is kept.
            </h1>
            <p className="text-aside mt-5 text-[1.35rem] leading-snug text-pretty text-muted-foreground sm:text-[1.6rem]">
              Luncheons, the list, the cellar.
            </p>
            <div className="club-rule-strong mt-8 w-12" />
            <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-pretty text-muted-foreground">
              A members’ book for clubs that meet over lunch. Fixed places,
              a fair list, a quiet cellar — and a committee that never again
              keeps the roll in a spreadsheet. Built for Beefsteaks &amp;
              Burgundy; open to any chapter that asks nicely.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Members’ entrance
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Establish a chapter
              </Button>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <BrandMark size="hero" className="text-primary/80" />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-px px-5 sm:px-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {NOTICES.map((n) => (
            <article
              key={n.title}
              className="border-b border-border py-10 last:border-b-0 md:border-b-0 md:px-8 md:py-14 md:first:pl-0 md:last:pr-0"
            >
              <p className="text-numeral text-[1.5rem] leading-none text-primary">
                {n.numeral}
              </p>
              <p className="club-kicker mt-5">{n.kicker}</p>
              <h2 className="text-h2 mt-2 text-balance text-foreground">{n.title}</h2>
              <p className="mt-3 max-w-prose text-[0.95rem] leading-relaxed text-pretty text-muted-foreground">
                {n.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center sm:px-6 sm:py-20">
          <p className="text-aside mx-auto max-w-2xl text-[1.5rem] leading-snug text-balance text-foreground sm:text-[1.9rem]">
            Named, we are told, after an incident. The minutes do not record
            which.
          </p>
          <p className="club-kicker mt-6">From the club history</p>
        </div>
      </section>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-[0.625rem] font-medium tracking-[0.18em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Drunken Peaches</span>
          <span>Each club is a private, isolated chapter</span>
        </div>
      </footer>
    </main>
  );
}
