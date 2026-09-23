import Link from "next/link";
import type { Metadata } from "next";
import { WineIcon } from "lucide-react";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/format";
import type { Membership } from "@/lib/types";
import { resendInviteAction } from "@/app/actions/members";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { DataList, type DataListColumn } from "@/components/data-list";
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

  const visible = ctx.isCommittee
    ? all
    : all.filter((m) => m.status === "active");
  const activeCount = all.filter((m) => m.status === "active").length;
  const committeeCount = all.filter(
    (m) => m.status === "active" && m.role === "committee"
  ).length;

  const columns: DataListColumn<Membership>[] = [
    {
      key: "name",
      header: "Name",
      primary: true,
      cell: (m) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{initials(m.full_name || m.email)}</AvatarFallback>
          </Avatar>
          <span className="text-foreground">{m.full_name || "—"}</span>
          {m.wine_master ? (
            <WineIcon
              className="size-3.5 text-gold"
              aria-label="Wine Master"
            />
          ) : null}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (m) => <span className="text-muted-foreground">{m.email}</span>,
    },
    {
      key: "phone",
      header: "Telephone",
      cell: (m) => (
        <span className="text-muted-foreground">{m.phone ?? "—"}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (m) => (
        <span className="capitalize text-muted-foreground">{m.role}</span>
      ),
    },
    ...(ctx.isCommittee
      ? [
          {
            key: "status",
            header: "Standing",
            cell: (m: Membership) => <StatusBadge status={m.status} />,
          },
          {
            key: "actions",
            header: <span className="sr-only">Actions</span>,
            headerClassName: "text-right",
            className: "text-right",
            primary: true,
            cell: (m: Membership) => (
              <div className="flex justify-end gap-1">
                {m.status === "invited" ? (
                  <form action={resendInviteAction.bind(null, slug, m.id)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      className="text-muted-foreground"
                    >
                      Re-send invitation
                    </Button>
                  </form>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/c/${slug}/members/${m.id}`} />}
                >
                  Edit
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-12">
      <ErrorBanner message={error} />
      <PageHeader
        kicker="The book"
        title="Members"
        description={
          <>
            <span className="text-foreground">{activeCount}</span> in good
            standing
            {committeeCount > 0 ? (
              <>
                , of whom{" "}
                <span className="text-foreground">{committeeCount}</span>{" "}
                {committeeCount === 1 ? "sits" : "sit"} on the committee.
              </>
            ) : (
              "."
            )}
          </>
        }
      />

      {ctx.isCommittee ? <InviteForm slug={slug} /> : null}

      <section className="space-y-5">
        <SectionHeading
          title={ctx.isCommittee ? "The roll" : "The roll"}
          count={visible.length}
        />
        <DataList columns={columns} rows={visible} rowKey={(m) => m.id} />
        {ctx.isCommittee ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Members are never erased. Mark them resigned, lapsed or removed and
            their attendance remains in the book.
          </p>
        ) : null}
      </section>
    </div>
  );
}
