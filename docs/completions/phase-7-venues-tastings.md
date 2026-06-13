# Phase 7 — Venues & tastings (back-of-house) — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓.
> Grep-clean: no native `<select>` / `text-stone-*` / `text-red-600` / `bg-white`
> in `app/c/[club]/venues`.

Goal: the pipeline — the differentiator vs WildApricot — looks like a deliberate
board, and the venue detail stops being a wall of inline forms.

## Venue pipeline — `venues/page.tsx` (7.1, 7.2)
- `PageHeader` + an **Add venue** action.
- A proper **kanban-ish board**: three columns (Candidates / Committee tasting /
  Approved) with a header, hint, and a rounded **count chip** each; refined
  `hover` venue cards (Fraunces name, icon'd address + capacity).
- Per-column **`EmptyState`** (compact dashed "Empty").
- Retired venues moved into a **collapsible `<details>` shelf** ("Rejected &
  archived (n)") with a rotating chevron — no JS, fully accessible.
- **Add venue (7.2)**: the bottom-of-page form is now an **`AddVenueDialog`** —
  a `Dialog` wrapping `VenueForm`; on a successful create it closes the dialog,
  resets, and toasts ("Venue added").

## Venue detail — `venues/[id]/page.tsx` (7.3, 7.4)
- Clear sections: header + **status-transition toolbar**, Details, Committee
  tastings, Lunches here, and a danger action.
- **Toolbar**: move-to-tasting / approve (primary) / **reject** (destructive via
  `ConfirmSubmit` → `ConfirmDialog`) / book-a-lunch / back-to-candidates — with
  primary vs destructive treatment.
- Header shows icon'd address + contact.
- **Tastings (7.4)**: each tasting is a tidy `Card` with a date input, a
  **`Select`** for the go/no-go outcome (was a native `<select>`), a `Textarea`
  for feedback, and a live outcome `StatusBadge`. The "Add a tasting" form is a
  clean responsive grid.
- Delete/Archive at the bottom via `ConfirmSubmit` (destructive), with copy that
  reflects whether the venue will be archived (has lunch history) or deleted.

## `VenueForm` updates
Added an `onSuccess` callback (used by the dialog to close) and a `useSuccessToast`
(toasts on create/update). Reset is gated on a genuine submit.

## loading skeletons (7.5)
`venues/loading.tsx` (3-column board) and `venues/[id]/loading.tsx`.

## Toast scope note
Status transitions and tasting add/edit are unchanged server-action forms that
redirect-only-on-error; their feedback is the immediate revalidated board/cards
(plus `?error=` banner). Venue create/update (via `VenueForm`, useActionState)
do toast.

## Acceptance criteria — met
- ✅ Pipeline reads as a board; venue lifecycle transitions are obvious and
  confirmed; tasting capture is comfortable on mobile (stacked grids).
