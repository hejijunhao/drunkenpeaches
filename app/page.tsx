import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheckIcon, UsersIcon, WineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { getMyClubs } from "@/lib/club-context";

const FEATURES = [
  {
    icon: UsersIcon,
    title: "Fixed-capacity sign-ups",
    body: "Capacity comes from the real restaurant booking. Members sign up first-come-first-served; everyone else queues on the waitlist and is auto-promoted when a seat frees up.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Committee back-of-house",
    body: "A venue pipeline from candidate to tasting to booked lunch, dietary summaries for the restaurant, manual overrides, and roster management.",
  },
  {
    icon: WineIcon,
    title: "Wine, handled",
    body: "Your Wine Master keeps a lightweight cellar and records each lunch's selection and pairing — then the app gets out of the way at the table.",
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
    // Signed in but no active membership — fall through to the landing page.
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              🍑
            </span>
            <span className="font-heading text-lg font-medium tracking-tight">
              Drunken Peaches
            </span>
          </span>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button render={<Link href="/signup" />}>Create your club</Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-28">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <span aria-hidden>🍑</span> For private dining clubs &amp; chapters
          </p>
          <h1 className="text-display text-balance text-foreground">
            Run your dining club without the 2007 clunk.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-balance text-muted-foreground">
            Lunches, sign-ups, waitlists, venues and wine — modern, fast member
            management for private dining clubs and chapters. Book the
            restaurant, release the lunch, and let first-come-first-served do
            the rest.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/signup" />}>
              Create your club
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/login" />}
            >
              Member log in
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title} hover className="gap-3 p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="font-heading text-base font-medium text-foreground">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground">{f.body}</p>
          </Card>
        ))}
      </section>

      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-muted-foreground">
          Built for clubs like Beefsteaks &amp; Burgundy. Every club is its own
          private, isolated tenant.
        </div>
      </footer>
    </main>
  );
}
