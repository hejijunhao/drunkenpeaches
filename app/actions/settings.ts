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
      })
      .eq("id", ctx.club.id);
    if (error) return { error: error.message };
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/c/${slug}/settings`);
  return {};
}
