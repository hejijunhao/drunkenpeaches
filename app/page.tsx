import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getMyClubs } from "@/lib/club-context";

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
    <main className="flex-1 flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-lg">
            🍑 Drunken Peaches
          </span>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button render={<Link href="/signup" />}>Create your club</Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          Run your dining club without the 2007 clunk.
        </h1>
        <p className="mt-6 text-lg text-stone-600 text-balance">
          Lunches, sign-ups, waitlists, venues and wine — modern, fast member
          management for private dining clubs and chapters. Book the
          restaurant, release the lunch, and let first-come-first-served do
          the rest.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" render={<Link href="/signup" />}>
            Create your club
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            Member log in
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Fixed-capacity sign-ups",
            body: "Capacity comes from the real restaurant booking. Members sign up first-come-first-served; everyone else queues on the waitlist and is auto-promoted when a seat frees up.",
          },
          {
            title: "Committee back-of-house",
            body: "A venue pipeline from candidate to tasting to booked lunch, dietary summaries for the restaurant, manual overrides, and roster management.",
          },
          {
            title: "Wine, handled",
            body: "Your Wine Master keeps a lightweight cellar and records each lunch's selection and pairing — then the app gets out of the way at the table.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border bg-white p-6">
            <h3 className="font-medium">{f.title}</h3>
            <p className="mt-2 text-sm text-stone-600">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-stone-500">
          Built for clubs like Beefsteaks &amp; Burgundy. Every club is its own
          private, isolated tenant.
        </div>
      </footer>
    </main>
  );
}
