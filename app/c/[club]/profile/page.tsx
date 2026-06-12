import type { Metadata } from "next";
import { getClubContext } from "@/lib/club-context";
import { fmtDateShort } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My profile" };

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

  const attendance = (history ?? [])
    .map((h) => ({
      ...h,
      lunch: h.lunches as unknown as {
        id: string;
        title: string;
        lunch_date: string;
        status: string;
      } | null,
    }))
    .filter((h) => h.lunch && h.status !== "cancelled");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="text-sm text-stone-500">
          {ctx.club.name} · member since {fmtDateShort(ctx.membership.joined_on)}
          {ctx.membership.role === "committee" && " · committee"}
          {ctx.membership.wine_master && " · 🍷 wine master"}
        </p>
      </div>

      <ProfileForm slug={slug} membership={ctx.membership} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My lunch history</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-sm text-stone-500">No lunches yet.</p>
          ) : (
            <ul className="space-y-2">
              {attendance.map((h) => (
                <li key={h.id} className="text-sm flex items-center gap-2 flex-wrap">
                  <span className="text-stone-500">
                    {fmtDateShort(h.lunch!.lunch_date)}
                  </span>
                  <span className="font-medium">{h.lunch!.title}</span>
                  <StatusBadge status={h.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
