import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataListColumn<T> {
  /** Stable key for the column. */
  key: string;
  /** Column header / mobile field label. */
  header: React.ReactNode;
  /** Cell renderer. */
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  /**
   * On mobile cards, render the value full-width with no label — for the
   * primary/identity column (e.g. a member's name).
   */
  primary?: boolean;
}

interface DataListProps<T> {
  columns: DataListColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Rendered (instead of the table/cards) when there are no rows. */
  empty?: React.ReactNode;
  className?: string;
}

/**
 * Responsive table: a real `<table>` at `sm`+ and stacked cards below it, so no
 * data is ever hidden on a phone. Replaces the responsive-hide column pattern.
 */
export function DataList<T>({
  columns,
  rows,
  rowKey,
  empty,
  className,
}: DataListProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <>
      {/* Tablet / desktop */}
      <div className="hidden sm:block">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.headerClassName}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="grid gap-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={rowKey(row)}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <dl className="grid gap-2">
              {columns.map((c) => (
                <div
                  key={c.key}
                  className={cn(
                    "flex items-start gap-3",
                    c.primary ? "flex-col" : "justify-between"
                  )}
                >
                  {!c.primary ? (
                    <dt className="shrink-0 text-xs font-medium text-muted-foreground">
                      {c.header}
                    </dt>
                  ) : null}
                  <dd
                    className={cn(
                      "text-sm",
                      c.primary ? "w-full font-medium" : "text-right"
                    )}
                  >
                    {c.cell(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
