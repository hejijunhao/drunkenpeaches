import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  const { club: slug } = await params;
  const ctx = await getClubContext(slug);
  if (!ctx.isCommittee) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Club settings</h1>
        <p className="text-sm text-stone-500">
          Club URL: <code className="text-xs">/c/{ctx.club.slug}</code>
        </p>
      </div>
      <SettingsForm slug={slug} club={ctx.club} />
    </div>
  );
}
