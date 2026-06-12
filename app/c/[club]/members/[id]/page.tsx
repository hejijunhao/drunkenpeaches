import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { fmtDateShort } from "@/lib/format";
import type { Membership } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { MemberEditForm } from "./member-edit-form";

export const metadata: Metadata = { title: "Edit member" };

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ club: string; id: string }>;
}) {
  const { club: slug, id } = await params;
  const ctx = await getClubContext(slug);
  if (!ctx.isCommittee) notFound();

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("memberships")
    .select("*")
    .eq("id", id)
    .eq("club_id", ctx.club.id)
    .single();
  if (!member) notFound();

  // Attendance history: completed lunches this member was confirmed for.
  const { data: history } = await supabase
    .from("signups")
    .select("id, status, attended, guest_count, lunches(id, title, lunch_date, status)")
    .eq("membership_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

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
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
          {(member as Membership).full_name || (member as Membership).email}
          <StatusBadge status={(member as Membership).status} />
        </h1>
        <p className="text-sm text-stone-500">
          Member since {fmtDateShort((member as Membership).joined_on)}
        </p>
      </div>

      <MemberEditForm
        slug={slug}
        member={member as Membership}
        isSelf={(member as Membership).id === ctx.membership.id}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance history</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-sm text-stone-500">No lunch history yet.</p>
          ) : (
            <ul className="space-y-2">
              {attendance.map((h) => (
                <li key={h.id} className="text-sm flex items-center gap-2 flex-wrap">
                  <span className="text-stone-500">
                    {fmtDateShort(h.lunch!.lunch_date)}
                  </span>
                  <span className="font-medium">{h.lunch!.title}</span>
                  <StatusBadge status={h.status} />
                  {h.attended === true && (
                    <span className="text-xs text-emerald-700">attended</span>
                  )}
                  {h.attended === false && (
                    <span className="text-xs text-red-600">no-show</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
