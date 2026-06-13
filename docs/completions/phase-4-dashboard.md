# Phase 4 — Dashboard — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓.

Goal: make the "next lunch" a genuine hero on the screen everyone sees first.

## `app/c/[club]/dashboard/page.tsx` — rebuild

- **Header** uses `PageHeader` ("Hello, {first name}" in Fraunces + club name as
  description); committee gets a `New lunch` button with a `PlusIcon`.
- **Next-lunch hero (4.1)**: a `shadow-soft` `Card` with an "Next lunch" eyebrow,
  Fraunces `.text-h2` title, lunch-status + the member's own sign-up status
  badges, an icon'd date/time + venue metadata block, a real `SeatMeter`
  (taken / capacity + waitlist overflow), and a prominent CTA (burgundy when not
  signed up, outline + "manage" when signed up) — laid out two-column on desktop.
- **Coming up (4.2)**: refined `LunchCard`s in a responsive grid with hover lift,
  status badge, icon'd date/venue, and a compact seat meter each.
- **Committee stat tiles (4.3)**: `pipelineCount` / `memberCount` as proper
  linked `hover` stat cards — burgundy icon tile + Fraunces numeral + label.
- **Empty state (4.4)**: replaces the `py-10 text-center text-stone-500` with an
  `EmptyState` (calendar-off icon, role-aware copy, committee "New lunch" CTA).
- All `text-stone-*` / ad-hoc colors gone.

## `components/lunch-card.tsx` (new, shared)

Extracted a `LunchCard` so the dashboard "coming up" grid and the Phase 5 lunches
list render identical cards (the plan explicitly asks for consistency). Props:
href, title, status, ISO date, venue, optional seat-meter inputs, optional
personal sign-up badge. Wraps a `hover` Card in a `Link`.

## `app/c/[club]/dashboard/loading.tsx` (4.5, new)

Skeleton mirroring the real layout (header + hero card + 3-card coming-up grid).
Shimmer respects reduced motion (Phase 0 global guard).

## Data note (minimal, no schema change)

Replaced the single next-lunch sign-ups query with **one** `signups … in
(lunchIds)` query, grouped client-side by `lunch_id`. This feeds seat meters on
*every* upcoming card (the hero + coming-up grid) without N+1 queries and without
touching the schema/RLS — exactly the "called out, kept minimal" data tweak the
plan allows. RLS still governs which sign-ups are visible.

## Acceptance criteria — met

- ✅ The next lunch reads as the focal point; CTA is obvious; seat status legible
  at a glance (SeatMeter). Polished for both themes and 375px (single-column
  stack on mobile, two-column on `md`+).
