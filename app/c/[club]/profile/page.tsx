import type { Metadata } from "next";
import { getClubContext } from "@/lib/club-context";
import { fmtDateShort, initials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AttendanceHistory,
  type AttendanceItem,
} from "@/components/attendance-history";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My particulars" };

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  const { club: slug } = await params;
  const ctx = await getClubContext(slug);
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("signups")
    .select("id, status, attended, lunches(id, title, lunch_date, status)")
    .eq("membership_id", ctx.membership.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const attendance: AttendanceItem[] = (history ?? [])
    .map((h) => ({
      raw: h,
      lunch: h.lunches as unknown as {
        id: string;
        title: string;
        lunch_date: string;
        status: string;
      } | null,
    }))
    .filter((h) => h.lunch && h.raw.status !== "cancelled")
    .map((h) => ({
      id: h.raw.id,
      date: h.lunch!.lunch_date,
      title: h.lunch!.title,
      status: h.raw.status,
      attended: h.raw.attended,
    }));

  return (
    <div className="space-y-10">
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar size="lg">
            <AvatarFallback>
              {initials(ctx.membership.full_name || ctx.membership.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2.5">
            <p className="club-kicker">
              {ctx.club.name} · member since{" "}
              {fmtDateShort(ctx.membership.joined_on)}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-h1 text-foreground">
                {ctx.membership.full_name || "My particulars"}
              </h1>
              <span className="flex items-center gap-1.5">
                {ctx.membership.role === "committee" ? (
                  <Badge variant="outline">Committee</Badge>
                ) : null}
                {ctx.membership.wine_master ? (
                  <Badge
                    variant="outline"
                    className="border-gold/60 text-gold-foreground dark:text-gold"
                  >
                    Wine Master
                  </Badge>
                ) : null}
              </span>
            </div>
          </div>
        </div>
        <div className="club-rule-strong" />
      </header>

      <ProfileForm slug={slug} membership={ctx.membership} />

      <section className="grid gap-5 border-t border-border pt-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12 md:pt-8">
        <div>
          <h2 className="text-h3 text-foreground">Appearance</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Cream by day, the cellar by night.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-4 py-3 text-sm">
          <span className="text-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </section>

      <AttendanceHistory items={attendance} />
    </div>
  );
}
