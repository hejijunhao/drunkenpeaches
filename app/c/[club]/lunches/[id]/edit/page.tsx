import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { LunchForm } from "../../lunch-form";
import { PageHeader } from "@/components/page-header";
import type { Lunch, Venue } from "@/lib/types";

export const metadata: Metadata = { title: "Edit lunch" };

export default async function EditLunchPage({
  params,
}: {
  params: Promise<{ club: string; id: string }>;
}) {
  const { club: slug, id } = await params;
  const ctx = await getClubContext(slug);
  if (!ctx.isCommittee) notFound();

  const supabase = await createClient();
  const [{ data: lunch }, { data: venues }] = await Promise.all([
    supabase
      .from("lunches")
      .select("*")
      .eq("id", id)
      .eq("club_id", ctx.club.id)
      .single(),
    supabase
      .from("venues")
      .select("id, name, status, default_capacity")
      .eq("club_id", ctx.club.id)
      .neq("status", "archived")
      .neq("status", "rejected")
      .order("name"),
  ]);
  if (!lunch) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit lunch"
        description="Attendees are notified if you change the date, time or venue of a released lunch."
      />
      <LunchForm
        slug={slug}
        lunch={lunch as Lunch}
        venues={(venues ?? []) as Pick<Venue, "id" | "name" | "status" | "default_capacity">[]}
      />
    </div>
  );
}
