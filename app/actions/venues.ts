"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCommittee, errorMessage } from "@/lib/action-helpers";
import type { FormState } from "./auth";

const venueSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  address: z.string().max(300).optional(),
  contact: z.string().max(200).optional(),
  defaultCapacity: z.coerce.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

function venuesPath(slug: string, id?: string) {
  return id ? `/c/${slug}/venues/${id}` : `/c/${slug}/venues`;
}

export async function createVenueAction(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const ctx = await requireCommittee(slug);
    const parsed = venueSchema.safeParse({
      name: formData.get("name"),
      address: String(formData.get("address") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      defaultCapacity: formData.get("defaultCapacity") || undefined,
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const d = parsed.data;
    const { error } = await ctx.supabase.from("venues").insert({
      club_id: ctx.club.id,
      name: d.name,
      address: d.address || null,
      contact: d.contact || null,
      default_capacity: d.defaultCapacity ?? null,
      notes: d.notes || null,
    });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(venuesPath(slug));
  return {};
}

export async function updateVenueAction(
  slug: string,
  venueId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const ctx = await requireCommittee(slug);
    const parsed = venueSchema.safeParse({
      name: formData.get("name"),
      address: String(formData.get("address") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      defaultCapacity: formData.get("defaultCapacity") || undefined,
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const d = parsed.data;
    const { error } = await ctx.supabase
      .from("venues")
      .update({
        name: d.name,
        address: d.address || null,
        contact: d.contact || null,
        default_capacity: d.defaultCapacity ?? null,
        notes: d.notes || null,
      })
      .eq("id", venueId);
    if (error) return { error: error.message };
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(venuesPath(slug, venueId));
  return {};
}

/** Move a venue through the pipeline: candidate → tasting → approved / rejected. */
export async function setVenueStatusAction(
  slug: string,
  venueId: string,
  status: "candidate" | "tasting" | "approved" | "rejected" | "archived"
) {
  let err: string | null = null;
  try {
    const ctx = await requireCommittee(slug);
    const { error } = await ctx.supabase
      .from("venues")
      .update({ status })
      .eq("id", venueId);
    if (error) throw new Error(error.message);
  } catch (e) {
    err = errorMessage(e);
  }
  revalidatePath(venuesPath(slug));
  revalidatePath(venuesPath(slug, venueId));
  if (err) redirect(`${venuesPath(slug, venueId)}?error=${encodeURIComponent(err)}`);
}

export async function addTastingAction(
  slug: string,
  venueId: string,
  formData: FormData
) {
  let err: string | null = null;
  try {
    const ctx = await requireCommittee(slug);
    const date = String(formData.get("tastingDate") ?? "").trim() || null;
    const { error } = await ctx.supabase.from("tastings").insert({
      club_id: ctx.club.id,
      venue_id: venueId,
      tasting_date: date,
      feedback: String(formData.get("feedback") ?? "").trim() || null,
    });
    if (error) throw new Error(error.message);
    // Scheduling a tasting moves a candidate into the tasting stage.
    await ctx.supabase
      .from("venues")
      .update({ status: "tasting" })
      .eq("id", venueId)
      .eq("status", "candidate");
  } catch (e) {
    err = errorMessage(e);
  }
  revalidatePath(venuesPath(slug, venueId));
  if (err) redirect(`${venuesPath(slug, venueId)}?error=${encodeURIComponent(err)}`);
}

export async function updateTastingAction(
  slug: string,
  venueId: string,
  tastingId: string,
  formData: FormData
) {
  let err: string | null = null;
  try {
    const ctx = await requireCommittee(slug);
    const outcome = String(formData.get("outcome") ?? "pending");
    const { error } = await ctx.supabase
      .from("tastings")
      .update({
        tasting_date: String(formData.get("tastingDate") ?? "").trim() || null,
        feedback: String(formData.get("feedback") ?? "").trim() || null,
        outcome,
      })
      .eq("id", tastingId);
    if (error) throw new Error(error.message);
  } catch (e) {
    err = errorMessage(e);
  }
  revalidatePath(venuesPath(slug, venueId));
  if (err) redirect(`${venuesPath(slug, venueId)}?error=${encodeURIComponent(err)}`);
}

export async function deleteVenueAction(slug: string, venueId: string) {
  let err: string | null = null;
  try {
    const ctx = await requireCommittee(slug);
    // Only pipeline venues can be deleted; venues with lunches are protected
    // by the FK (lunches.venue_id) being set null — but keep history tidy by
    // archiving instead when the venue has been used.
    const { count } = await ctx.supabase
      .from("lunches")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId);
    if (count && count > 0) {
      await ctx.supabase
        .from("venues")
        .update({ status: "archived" })
        .eq("id", venueId);
    } else {
      const { error } = await ctx.supabase
        .from("venues")
        .delete()
        .eq("id", venueId);
      if (error) throw new Error(error.message);
    }
  } catch (e) {
    err = errorMessage(e);
  }
  revalidatePath(venuesPath(slug));
  if (err) redirect(`${venuesPath(slug)}?error=${encodeURIComponent(err)}`);
  redirect(venuesPath(slug));
}
