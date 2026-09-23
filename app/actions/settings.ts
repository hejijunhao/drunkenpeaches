"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCommittee, errorMessage } from "@/lib/action-helpers";
import type { FormState } from "./auth";

const settingsSchema = z.object({
  name: z.string().min(2, "Club name is too short").max(80),
  guestsAllowed: z.boolean(),
  maxGuests: z.coerce.number().int().min(0).max(10),
  cutoffDays: z.coerce.number().int().min(0).max(30),
  committeePriorityDays: z.coerce.number().int().min(0).max(60),
  membersOnlyDays: z.coerce.number().int().min(0).max(90),
  guestsPhaseDays: z.coerce.number().int().min(0).max(90),
});

export async function updateClubSettingsAction(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const ctx = await requireCommittee(slug);
    const parsed = settingsSchema.safeParse({
      name: formData.get("name"),
      guestsAllowed: formData.get("guestsAllowed") === "on",
      maxGuests: formData.get("maxGuests"),
      cutoffDays: formData.get("cutoffDays"),
      committeePriorityDays: formData.get("committeePriorityDays"),
      membersOnlyDays: formData.get("membersOnlyDays"),
      guestsPhaseDays: formData.get("guestsPhaseDays"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const d = parsed.data;
    const { error } = await ctx.supabase
      .from("clubs")
      .update({
        name: d.name,
        guests_allowed: d.guestsAllowed,
        max_guests_per_member: d.maxGuests,
        signup_cutoff_days: d.cutoffDays,
        committee_priority_days: d.committeePriorityDays,
        members_only_days: d.membersOnlyDays,
        guests_phase_days: d.guestsPhaseDays,
      })
      .eq("id", ctx.club.id);
    if (error) return { error: error.message };
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/c/${slug}/settings`);
  return {};
}
