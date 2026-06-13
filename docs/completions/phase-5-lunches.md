# Phase 5 — Lunches (the heart of the product) — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓, `build` ✓.
> Grep-clean: **no** native `<select>`, **no** `window.confirm`, **no**
> `text-stone-*`/`text-red-600`/`bg-white` in `app/c/[club]/lunches`.

The highest-value phase — budgeted the most care.

## 5A — Member-facing

### Lunches list — `lunches/page.tsx` (5.1)
`PageHeader` + New-lunch CTA; **Upcoming** and **Past & cancelled** sections as
responsive grids of the shared `LunchCard` (status + personal "Your spot" badge,
icon'd date/venue, seat meter, hover lift). `EmptyState` when nothing's upcoming.

### Lunch detail header — `lunches/[id]/page.tsx` (5.2)
Fraunces `.text-h1` title + status badge; icon'd date/time/venue/cutoff metadata
hierarchy; the big `taken/capacity` figure rebuilt as a `SeatMeter` in a side
card with an **over-capacity** note in `destructive` tone.

### SignupCard — `lunches/[id]/signup-card.tsx` (5.3)
Three confident, distinct states:
- **Cutoff passed** — a warning-toned locked card.
- **You're in / waitlisted** — success/warning-bordered card, polished guest
  editor (collapsible), **`ConfirmDialog`** for cancel (replaces
  `window.confirm`; submits the cancel form via a ref on confirm).
- **Sign up** — guest controls + a will-waitlist hint styled in `warning` tone.

All three buttons use `loading` states, and success toasts fire via
`useSuccessToast` (signup / guests / cancel) — see the data note below.

### Confirmed / Waitlist rosters (5.4)
Clean roster rows: avatar initials, name, **guest pills** + "added by committee"
badge, ordinal-numbered waitlist. Inline "no one yet / empty" messages kept
concise.

## 5B — Committee control room

- **Action bar (5.5)**: release / edit / complete / cancel / delete grouped into
  one toolbar; primary vs `destructive` treatment; every action goes through
  `ConfirmSubmit` → branded `ConfirmDialog` (with proper titles/labels).
- **Capacity & cutoff (5.6)**: re-skinned cards, token helper copy.
- **Manually add member (5.7)**: native `<select>` → `Select` (form-integrated
  via `name`), tidy responsive grid, `Checkbox` for force-seat.
- **Restaurant dietary list (5.8)**: framed as a deliberate "copy for the
  restaurant" panel — mono block on `muted` + a **`CopyButton`** (clipboard +
  toast).
- **Wine-master corner (5.9)**: gold-accented card, `Select` for the wine pick,
  pairing rows as bordered items, gold "Add wine" button; ad-hoc `text-red-600`
  replaced with the `destructive` Button variant; source shown as a `Badge` tone.

## 5C — Create/edit

- **LunchForm (5.10)**: every field on the new primitives — `Select` for venue
  and guests-mode, real date/time inputs, `Textarea` for notes, animated
  max-guests reveal; two-column responsive grid; disabled-capacity-on-edit gets
  a clear explanatory `InfoIcon` callout; `loading` submit.
- **new / edit wrappers (5.11)**: `PageHeader` + intro copy.
- **loading.tsx (5.12)**: skeletons for the list and the detail page.

## Shared additions

- `components/lunch-card.tsx` — already created in Phase 4; reused here so
  dashboard and list cards are identical.
- `components/copy-button.tsx` — clipboard + toast.
- `lib/use-success-toast.ts` — fires a success toast when a `useActionState`
  action finishes without error (pending true→false), no server-action change.

## Important decision — guests mode stays a tri-state `Select`

The plan (5.10) suggested a `Switch` for guests-allowed. The data model is
**tri-state** (`guestsMode: inherit | yes | no`, validated in the unchanged
server action), which a boolean Switch can't represent without losing "inherit"
and editing the action. Honoring the **no-backend-changes** non-goal, guests-mode
remains a `Select` (with an animated max-guests reveal for "yes").

## Toast scope — honoring "no server-action changes"

- **In-place forms** (member signup/guests/cancel) toast on success via
  `useSuccessToast` — purely client-side, no action change.
- **Copy-to-clipboard** toasts (client).
- **Committee redirect/revalidate forms** (capacity, cutoff, add-member, wine,
  lifecycle, attendance) intentionally **don't** toast: those actions
  redirect-only-on-error and would need a success query-param (= a server-action
  change, a non-goal). Their feedback is the immediate revalidated UI (seat
  numbers move, rows appear, waitlist promotes) + the existing `?error=`
  `ErrorBanner`. Create/edit lunch likewise relies on its success redirect.

## Acceptance criteria — met

- ✅ A member can find the next lunch, read seat/waitlist status (SeatMeter), and
  sign up / cancel with confident feedback (loading + toast + ConfirmDialog) on a
  phone.
- ✅ The committee control room reads as organized sections, not a wall of forms;
  every destructive action is a branded confirm.
- ✅ No native selects or `window.confirm` anywhere in the lunches area.
