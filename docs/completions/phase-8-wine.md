# Phase 8 — Wine (back-of-house) — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓.
> Grep-clean: no native `<select>` / `text-stone-*` / `text-red-600` / `bg-white`
> in `app/c/[club]/wine`.

Goal: the cellar catalogue gets the gold-accented treatment the subject
deserves, while staying lightweight.

## Wine catalogue — `wine/page.tsx` (8.1)
- `PageHeader` with a **gold wine-glass** icon in the title (the brand premium
  accent).
- The responsive-hide table → **`DataList`** (reflows to labelled cards on
  mobile): name, vintage, **source pill** (`info` tone for club cellar, `neutral`
  for restaurant list), notes, and a right-aligned delete.
- Empty cellar shows an **`EmptyState`** (wine icon) instead of an empty table
  row.
- Delete goes through **`ConfirmSubmit` → `ConfirmDialog`** (destructive).

## WineForm — `wine/wine-form.tsx` (8.2)
- The mixed `flex` widths replaced by a clean 6-column responsive grid (name /
  vintage / source / notes / add).
- **`Select`** for source (cellar / restaurant list).
- **Success toast** ("Wine added to the catalogue") via `useSuccessToast`; reset
  gated on a genuine submit.

## `wine/loading.tsx` (8.3)
Skeleton: header + add card + table placeholder.

## Decision — vintage stays a free-text input
The plan (8.2) mentioned "Select for source/vintage". Source is a `Select`, but
**vintage is kept as a free-text `Input`**: vintages include "NV" (non-vintage)
and multi-vintage notes, which a year-list Select can't express — and the
unchanged Zod schema treats vintage as a free string. So source = Select,
vintage = Input.

## Acceptance criteria — met
- ✅ Catalogue is pleasant on mobile (DataList reflow); add/delete give clear
  feedback (toast on add, confirm dialog on delete).
