import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WineIcon } from "lucide-react";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import type { Wine } from "@/lib/types";
import { deleteWineAction } from "@/app/actions/wine";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { DataList, type DataListColumn } from "@/components/data-list";
import { EmptyState } from "@/components/empty-state";
import { ErrorBanner } from "@/components/error-banner";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { WineForm } from "./wine-form";

export const metadata: Metadata = { title: "The cellar" };

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
  const cellarCount = wines.filter((w) => w.source === "cellar").length;

  const columns: DataListColumn<Wine>[] = [
    {
      key: "name",
      header: "Wine",
      primary: true,
      cell: (w) => (
        <span className="font-heading text-[1.05rem] text-foreground">
          {w.name}
        </span>
      ),
    },
    {
      key: "vintage",
      header: "Vintage",
      cell: (w) => (
        <span className="text-numeral text-base text-foreground">
          {w.vintage ?? "—"}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      cell: (w) => (
        <Badge tone={w.source === "cellar" ? "info" : "neutral"}>
          {w.source === "cellar" ? "Club cellar" : "House list"}
        </Badge>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      className: "whitespace-normal",
      cell: (w) => (
        <span className="text-muted-foreground">{w.notes ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "text-right",
      className: "text-right",
      primary: true,
      cell: (w) => (
        <form action={deleteWineAction.bind(null, slug, w.id)} className="flex justify-end">
          <ConfirmSubmit
            confirmTitle="Remove wine?"
            confirmMessage={`Remove ${w.name} from the catalogue?`}
            confirmLabel="Remove"
            destructive
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            Remove
          </ConfirmSubmit>
        </form>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      <ErrorBanner message={error} />
      <PageHeader
        kicker="The cellar"
        title="Wine"
        description={
          <>
            A short catalogue of the club cellar and picks from the house list.
            Wines are assigned to each luncheon from its page. No bottle
            counting.
          </>
        }
      />

      <Card className="border-gold/50">
        <CardHeader>
          <CardTitle className="text-gold-foreground dark:text-gold">
            Record a wine
          </CardTitle>
          <CardDescription>
            Name and vintage as they appear on the label.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WineForm slug={slug} />
        </CardContent>
      </Card>

      <section className="space-y-5">
        <SectionHeading
          title="The catalogue"
          count={wines.length}
          description={
            wines.length > 0
              ? `${cellarCount} in the club cellar, ${wines.length - cellarCount} from house lists.`
              : undefined
          }
        />
        <DataList
          columns={columns}
          rows={wines}
          rowKey={(w) => w.id}
          empty={
            <EmptyState
              icon={WineIcon}
              title="The cellar is empty"
              description="Record a bottle from the club cellar or a pick from the house list."
              aside="A situation the Wine Master will wish to correct."
            />
          }
        />
      </section>
    </div>
  );
}
