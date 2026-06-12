# Architecture

Living technical companion to [vision.md](./vision.md). Records stack and key technical
decisions as they're made.

## Stack (decided)

| Layer | Choice | Notes |
| --- | --- | --- |
| **Language** | TypeScript end-to-end | One language across FE + server |
| **Framework** | Next.js (App Router) | Full-stack — FE + server logic in one app |
| **Backend** | Next.js Server Actions + Route Handlers | **No separate backend service** |
| **UI** | Tailwind CSS + shadcn/ui | Modern, fast to build, responsive/mobile-first |
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

## Known v1 limitations
- Cutoff datetimes are entered/displayed in UTC (no per-club timezone yet).
- A user who is invited to a second club reuses their existing account and is
  activated immediately (no second invite email flow).
- No public application/nomination flow (by design, v1).
