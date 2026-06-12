"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCommittee, errorMessage } from "@/lib/action-helpers";
import type { FormState } from "./auth";

const wineSchema = z.object({
  name: z.string().min(1, "Wine name is required").max(160),
  vintage: z.string().max(20).optional(),
  source: z.enum(["cellar", "restaurant"]),
  notes: z.string().max(2000).optional(),
});

export async function createWineAction(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const ctx = await requireCommittee(slug);
    const parsed = wineSchema.safeParse({
      name: formData.get("name"),
      vintage: String(formData.get("vintage") ?? ""),
      source: formData.get("source") ?? "cellar",
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const d = parsed.data;
    const { error } = await ctx.supabase.from("wines").insert({
      club_id: ctx.club.id,
      name: d.name,
      vintage: d.vintage || null,
      source: d.source,
      notes: d.notes || null,
    });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/c/${slug}/wine`);
  return {};
}

export async function deleteWineAction(slug: string, wineId: string) {
  let err: string | null = null;
  try {
    const ctx = await requireCommittee(slug);
    const { error } = await ctx.supabase.from("wines").delete().eq("id", wineId);
    if (error) throw new Error(error.message);
  } catch (e) {
    err = errorMessage(e);
  }
  revalidatePath(`/c/${slug}/wine`);
  if (err) redirect(`/c/${slug}/wine?error=${encodeURIComponent(err)}`);
}

/** Wine Master selects a wine for a lunch and records the intended pairing. */
export async function addLunchWineAction(
  slug: string,
  lunchId: string,
  formData: FormData
) {
  let err: string | null = null;
  try {
    const ctx = await requireCommittee(slug);
    const wineId = String(formData.get("wineId") ?? "");
    if (!wineId) throw new Error("Pick a wine");
    const { error } = await ctx.supabase.from("lunch_wines").insert({
      club_id: ctx.club.id,
      lunch_id: lunchId,
      wine_id: wineId,
      pairing_notes: String(formData.get("pairingNotes") ?? "").trim() || null,
    });
    if (error)
      throw new Error(
        error.code === "23505" ? "That wine is already selected" : error.message
      );
  } catch (e) {
    err = errorMessage(e);
  }
  revalidatePath(`/c/${slug}/lunches/${lunchId}`);
  if (err)
    redirect(`/c/${slug}/lunches/${lunchId}?error=${encodeURIComponent(err)}`);
}

export async function removeLunchWineAction(
  slug: string,
  lunchId: string,
  lunchWineId: string
) {
  let err: string | null = null;
  try {
    const ctx = await requireCommittee(slug);
    const { error } = await ctx.supabase
      .from("lunch_wines")
      .delete()
      .eq("id", lunchWineId);
    if (error) throw new Error(error.message);
  } catch (e) {
    err = errorMessage(e);
  }
  revalidatePath(`/c/${slug}/lunches/${lunchId}`);
  if (err)
    redirect(`/c/${slug}/lunches/${lunchId}?error=${encodeURIComponent(err)}`);
}
