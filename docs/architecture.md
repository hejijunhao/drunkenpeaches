# Architecture

Living technical companion to [vision.md](./vision.md). Records stack and key technical
decisions as they're made. Singapore product baseline (what to build next):
[plans/singapore-bsb-roadmap-2026.md](./plans/singapore-bsb-roadmap-2026.md).

## Stack (decided)

| Layer | Choice | Notes |
| --- | --- | --- |
| **Language** | TypeScript end-to-end | One language across FE + server |
| **Framework** | Next.js (App Router) | Full-stack — FE + server logic in one app |
| **Backend** | Next.js Server Actions + Route Handlers | **No separate backend service** |
| **UI** | Tailwind CSS v4 + shadcn/ui (base-ui) | "Club stationery" design system, light + dark, mobile-first — see [Design system](#design-system-ui-2026) |
| **Database** | Supabase (Postgres) | Also provides Auth, RLS, storage, edge functions |
| **Auth** | Supabase Auth — **email + password only** (v1) | No social/magic-link for now |
| **Transactional email** | Resend | App notifications (confirmations, reminders) |
| **Hosting** | Vercel (app) + Supabase cloud (data) | Free tiers cover early scale comfortably |

## Multi-tenancy (foundational)

Tenant = **club/chapter**. Isolation is enforced at the **database** via Postgres
**Row-Level Security (RLS)**, not in application code.

- Every tenant-scoped table carries a **`club_id`**.
- A **`memberships`** table maps `user ↔ club ↔ role` (`member` | `committee`, plus a
  `wine_master` flag on a committee membership).
- RLS policies ensure a signed-in user can only read/write rows for clubs they belong to.
- **Self-serve club signup:** the person who signs up creates the club row and gets a
  `committee` membership for it (their first admin).

## Server-side privileges

- **Member-facing reads/writes** go through the user's session → RLS enforces tenant + role.
- **Privileged operations** (sending member invites, admin actions) run **server-side** in
  Next.js using the Supabase **service-role key** — never exposed to the client.
- Business rules that must be reliable (waitlist auto-promotion, sign-up cutoff locking,
  capacity changes) live in **server-side logic**, not the client.

## Why this shape

- Smallest thing to build, run, and deploy for a solo/at-cost build — one codebase, one deploy.
- RLS is the cleanest answer to the multi-tenant isolation requirement (enforced in the DB).
- Mobile-friendly web covers members signing up on phones without a native app.

## Data model (implemented — `supabase/migrations/00001_init.sql`)

- **clubs** — the tenant. Club-level settings: `guests_allowed`,
  `max_guests_per_member`, `signup_cutoff_days` (default cutoff).
- **memberships** — `user ↔ club ↔ role` plus the member's club-scoped profile
  (name, phone, dietary). `role` (member/committee), `wine_master` flag,
  `status` (invited/active/resigned/lapsed/removed — never hard-deleted).
- **venues** — first-class pipeline entity: candidate → tasting → approved
  (→ rejected/archived). **tastings** hang off a venue (date, feedback, go/no-go).
- **lunches** — venue, date/time, fixed `capacity`, `status`
  (draft → released → completed / cancelled), `signup_cutoff_at`, per-lunch
  guest overrides (null = inherit club).
- **signups** — one per member per lunch: confirmed/waitlisted/cancelled,
  `guest_count` (guests consume seats), `created_at` is the FCFS order,
  `attended` for history.
- **wines** + **lunch_wines** — lightweight catalogue & per-lunch selection
  with pairing notes (committee-only; no member-facing wine data).

### Business rules live in SQL functions (SECURITY DEFINER)

Sign-up, cancel, waitlist auto-promotion, capacity change and cutoff
enforcement are Postgres functions (`sign_up_for_lunch`, `cancel_my_signup`,
`promote_from_waitlist`, `set_lunch_capacity`, `cancel_lunch`, …) so they are
atomic (row-locked) and cannot be bypassed from any client. `signups` has no
direct write policies at all. Promotion functions return who was promoted so
the app layer sends the notification emails.

### RLS summary

- Helpers: `is_member_of(club)`, `is_committee_of(club)` (security definer to
  avoid policy recursion).
- Members read their club, roster, venues, non-draft lunches and signups;
  committee additionally reads drafts/tastings/wines and writes everything.
- Club creation and member invites run server-side with the service-role key.

### Email (Resend, implemented)

Invite, sign-up confirmed, waitlisted, promoted from waitlist, lunch
changed/cancelled, password reset — plus a daily Vercel cron
(`/api/cron/reminders`) for the ~2-days-before reminder. No email on release
(per vision). Emails no-op gracefully when `RESEND_API_KEY` is unset.

## Design system (UI, 2026)

The front end is **club stationery**: laid-cream paper, oxblood ink, a little
brass, hairline rules, an engraved peach seal — with full **light and dark**
themes. Front-end only — no data-model/RLS/server-action changes. History in
[`docs/CHANGELOG.md`](./CHANGELOG.md) (0.2.0 → 0.4.0) and
[`docs/completions/`](./completions/).

- **Tokens, not hardcoded colors.** All color/elevation/motion is OKLCH CSS
  variables in `app/globals.css` (`@theme inline`): semantic surfaces
  (`background`/`card`/`primary`/`muted`/`accent`…), a `--gold` brass accent
  (hairlines and text, never a fill), a status set (`success`/`warning`/
  `danger`/`neutral`/`info`), `--radius` 0.25rem, `shadow-soft` (a hairline at
  rest) / `shadow-lifted` (overlays only), motion tokens, and a global
  `prefers-reduced-motion` guard.
- **Theming.** `next-themes` (`class` strategy, `system` default) via
  `components/theme-provider.tsx`; `ThemeToggle` in the masthead and profile.
- **Typography.** Newsreader (`--font-newsreader` → `--font-heading`, with
  `opsz` and italics) for titles, numerals and asides via `.text-display`,
  `.text-h1/.h2/.h3`, `.text-numeral`, `.text-aside`; **Hanken Grotesk** for
  the interface; Geist Mono for the restaurant export block. Small-cap labels
  everywhere via `.club-kicker` (also the `Label` and table-head style).
- **Brand.** `components/brand-mark.tsx` — the seal (`BrandMark`, sizes `xs`
  → `hero`, inherits `currentColor`) and the wordmark (`BrandWordmark`,
  *Drunken* in italic). In-club chrome shows the club's name beside the seal.
- **Primitives** (`components/ui/*`, base-ui): Button (`loading`, brass
  `gold`), Card (hairline; `CardTitle` is small caps, `serif` for statements),
  Badge (a stamp; `tone` + `dot`), Input/Textarea/Select/Label, Table (ruled
  ledger), Dialog, Avatar (roundel), Skeleton.
- **Shared**: `PageHeader` (rule beneath), `SectionHeading` + `RuleLabel`,
  `FormSection`/`FormFooter` (two-column ruled forms), `LunchCard` (calendar
  tile), `SeatMeter`, `StatusBadge` (+ `statusLabel`), `EmptyState`,
  `DataList` (table → ruled entries on phones), `ConfirmDialog`/`ConfirmSubmit`,
  `AttendanceHistory`, `CopyButton`, `AuthShell`, `PageHeaderSkeleton`/
  `RowsSkeleton`, and `sonner` toasts (`lib/toast.ts`).
- **Conventions.** Every in-app index page opens with `PageHeader`; detail
  pages use the same kicker / serif title / rule pattern; committee-only areas
  sit under a `RuleLabel`; long forms use `FormSection`; empties use
  `EmptyState`; every confirm is a `ConfirmDialog`; in-place form successes
  toast; every `<select>` is the `Select` primitive; data routes have
  `loading.tsx` skeletons. Status words are the club's (Open, Held, Waiting,
  Declined) via `StatusBadge`.

## Known v1 limitations
- Cutoff datetimes are entered/displayed in UTC (no per-club timezone yet).
- A user who is invited to a second club reuses their existing account and is
  activated immediately (no second invite email flow).
- No public application/nomination flow (by design, v1).
- Committee redirect/revalidate forms (lunch lifecycle, capacity/cutoff, venue
  transitions, tastings) surface success via the revalidated UI rather than a
  toast — toasts there would require changing the server actions (a redesign
  non-goal). Errors still surface via `?error=` banners.
- Brand favicon/OG image still use placeholders (metadata fields are set; a
  designed asset is pending).
