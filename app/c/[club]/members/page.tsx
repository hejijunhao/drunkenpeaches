import Link from "next/link";
import type { Metadata } from "next";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import type { Membership } from "@/lib/types";
import { resendInviteAction } from "@/app/actions/members";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBanner } from "@/components/error-banner";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ club: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { club: slug } = await params;
  const { error } = await searchParams;
  const ctx = await getClubContext(slug);
  const supabase = await createClient();

  const { data } = await supabase
    .from("memberships")
    .select("*")
    .eq("club_id", ctx.club.id)
    .order("full_name");
  const all = (data ?? []) as Membership[];

  // Members see the directory of active members; committee sees everyone.
  const visible = ctx.isCommittee
    ? all
    : all.filter((m) => m.status === "active");

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-stone-500">
          {all.filter((m) => m.status === "active").length} active members
        </p>
      </div>

      {ctx.isCommittee && <InviteForm slug={slug} />}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Role</TableHead>
              {ctx.isCommittee && <TableHead>Status</TableHead>}
              {ctx.isCommittee && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  {m.full_name || "—"}
                  {m.wine_master && (
                    <span title="Wine Master" className="ml-1">
                      🍷
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-stone-600">
                  {m.email}
                </TableCell>
                <TableCell className="hidden md:table-cell text-stone-600">
                  {m.phone ?? "—"}
                </TableCell>
                <TableCell className="capitalize text-stone-600">
                  {m.role}
                </TableCell>
                {ctx.isCommittee && (
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                )}
                {ctx.isCommittee && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {m.status === "invited" && (
                        <form action={resendInviteAction.bind(null, slug, m.id)}>
                          <Button variant="ghost" size="sm" type="submit">
                            Re-send invite
                          </Button>
                        </form>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={`/c/${slug}/members/${m.id}`} />}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {ctx.isCommittee && (
        <p className="text-xs text-stone-500">
          Members are never deleted — mark them resigned, lapsed or removed and
          their attendance history is preserved.
        </p>
      )}
    </div>
  );
}
