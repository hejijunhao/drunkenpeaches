import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { LunchForm } from "../lunch-form";
import { PageHeader } from "@/components/page-header";
import type { Venue } from "@/lib/types";

export const metadata: Metadata = { title: "New lunch" };

export default async function NewLunchPage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  const { club: slug } = await params;
  const ctx = await getClubContext(slug);
  if (!ctx.isCommittee) notFound();

  const supabase = await createClient();
  const { data: venues } = await supabase
    .from("venues")
    .select("id, name, status, default_capacity")
    .eq("club_id", ctx.club.id)
    .neq("status", "archived")
    .neq("status", "rejected")
    .order("name");

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Committee"
        title="Arrange a lunch"
        description="Book the restaurant first. Capacity is taken from that booking."
      />
      <LunchForm
        slug={slug}
        club={ctx.club}
        venues={(venues ?? []) as Pick<Venue, "id" | "name" | "status" | "default_capacity">[]}
      />
    </div>
  );
}
