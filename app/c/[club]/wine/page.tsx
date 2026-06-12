import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import type { Wine } from "@/lib/types";
import { deleteWineAction } from "@/app/actions/wine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBanner } from "@/components/error-banner";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { WineForm } from "./wine-form";

export const metadata: Metadata = { title: "Wine cellar" };

export default async function WinePage({
  params,
  searchParams,
}: {
  params: Promise<{ club: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { club: slug } = await params;
  const { error } = await searchParams;
  const ctx = await getClubContext(slug);
  if (!ctx.isCommittee) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("wines")
    .select("*")
    .eq("club_id", ctx.club.id)
    .order("name");
  const wines = (data ?? []) as Wine[];

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">🍷 Wine</h1>
        <p className="text-sm text-stone-500">
          A lightweight catalogue — the club cellar plus restaurant-list picks.
          Select wines for a specific lunch from that lunch&apos;s page. No
          bottle counting in v1.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add to the catalogue</CardTitle>
        </CardHeader>
        <CardContent>
          <WineForm slug={slug} />
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wine</TableHead>
              <TableHead>Vintage</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {wines.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-stone-500 py-8">
                  The cellar is empty — add your first wine above.
                </TableCell>
              </TableRow>
            )}
            {wines.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell>{w.vintage ?? "—"}</TableCell>
                <TableCell className="hidden sm:table-cell text-stone-600">
                  {w.source === "cellar" ? "Club cellar" : "Restaurant list"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-stone-600">
                  {w.notes ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <form action={deleteWineAction.bind(null, slug, w.id)}>
                    <ConfirmSubmit
                      confirmMessage={`Remove ${w.name} from the catalogue?`}
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                    >
                      Remove
                    </ConfirmSubmit>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
