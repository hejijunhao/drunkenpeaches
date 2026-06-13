import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WineIcon } from "lucide-react";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import type { Wine } from "@/lib/types";
import { deleteWineAction } from "@/app/actions/wine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { DataList, type DataListColumn } from "@/components/data-list";
import { EmptyState } from "@/components/empty-state";
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

  const columns: DataListColumn<Wine>[] = [
    {
      key: "name",
      header: "Wine",
      primary: true,
      cell: (w) => <span className="font-medium">{w.name}</span>,
    },
    {
      key: "vintage",
      header: "Vintage",
      cell: (w) => (
        <span className="tabular-nums">{w.vintage ?? "—"}</span>
      ),
    },
    {
      key: "source",
      header: "Source",
      cell: (w) => (
        <Badge tone={w.source === "cellar" ? "info" : "neutral"}>
          {w.source === "cellar" ? "Club cellar" : "Restaurant list"}
        </Badge>
      ),
    },
    {
      key: "notes",
      header: "Notes",
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
        <form action={deleteWineAction.bind(null, slug, w.id)}>
          <ConfirmSubmit
            confirmTitle="Remove wine?"
            confirmMessage={`Remove ${w.name} from the catalogue?`}
            confirmLabel="Remove"
            variant="destructive"
            size="sm"
          >
            Remove
          </ConfirmSubmit>
        </form>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <WineIcon className="size-7 text-gold" />
            Wine cellar
          </span>
        }
        description="A lightweight catalogue — the club cellar plus restaurant-list picks. Pick wines for a lunch from that lunch's page. No bottle counting in v1."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add to the catalogue</CardTitle>
        </CardHeader>
        <CardContent>
          <WineForm slug={slug} />
        </CardContent>
      </Card>

      <DataList
        columns={columns}
        rows={wines}
        rowKey={(w) => w.id}
        empty={
          <EmptyState
            icon={WineIcon}
            title="The cellar is empty"
            description="Add your first wine above — cellar bottles or restaurant-list picks."
          />
        }
      />
    </div>
  );
}
