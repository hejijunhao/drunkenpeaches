import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { LunchForm } from "../lunch-form";
import { PageHeader } from "@/components/page-header";
import type { Venue } from "@/lib/types";

export const metadata: Metadata = { title: "Arrange a lunch" };

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
    <div className="space-y-10">
      <PageHeader
        kicker="Committee"
        title="Arrange a lunch"
        description="It starts as a draft. Release it to members from the lunch page once the table is booked."
      />
      <LunchForm
        slug={slug}
        venues={(venues ?? []) as Pick<Venue, "id" | "name" | "status" | "default_capacity">[]}
      />
    </div>
  );
}
