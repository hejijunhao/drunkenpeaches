# Changelog

All notable changes to Drunken Peaches are recorded here. Newest first.

## Index

- **[0.1.0](#010--2026-06-13)** — Initial build: multi-tenant club lunch & member management (auth, members, venues, lunches, sign-ups/waitlist, wine, email, reminder cron).

---

## 0.1.0 — 2026-06-13

The first complete build of Drunken Peaches: a multi-tenant SaaS that replaces
WildApricot for private dining clubs. Every club/chapter is an isolated tenant;
the committee runs lunches against venues and members sign up against a fixed,
booking-driven capacity with an automatic waitlist.

### Foundation

- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript, full-stack with
  Server Actions and Route Handlers — no separate backend service.
- **Database:** Supabase Postgres, accessed via `@supabase/ssr` (browser +
  server clients) and a server-only service-role client for privileged work.
- **UI:** Tailwind CSS v4 + shadcn/ui, mobile-first (members sign up on phones).
- **Email:** Resend for all transactional mail; degrades gracefully to console
  logging when `RESEND_API_KEY` is unset.
- **Hosting:** Vercel (app + daily cron) + Supabase cloud.

### Multi-tenancy & security

- **Tenant = club.** Every tenant-scoped table carries `club_id`; isolation is
  enforced in the database with **Row-Level Security**, not application code.
- **RLS helpers** (`is_member_of`, `is_committee_of`, `is_wine_master_of`) are
  `SECURITY DEFINER` so membership policies don't recurse.
- **17 RLS policies** across 8 tables: members read their club's roster, venues,
  lunches (non-draft) and sign-ups; committee manages everything; drafts and
  back-of-house (tastings, wines, pairings) are committee-only.
- **All sign-up/waitlist/capacity mutations run through `SECURITY DEFINER`
  Postgres functions** — `signups` has no direct write policy, so capacity,
  cutoff and waitlist rules are atomic, row-locked, and impossible to bypass
  from the client.

### Database schema (`supabase/migrations/00001_init.sql`)

- **8 tables:** `clubs`, `memberships`, `venues`, `tastings`, `lunches`,
  `signups`, `wines`, `lunch_wines`.
- **7 enums:** member role, membership status, venue status, tasting outcome,
  lunch status, signup status, wine source.
- **14 functions:** 3 RLS helpers + 11 business-logic functions (below).

### Authentication & onboarding

- Supabase Auth, **email + password only** in v1 (no social/magic-link).
- **Self-serve club signup** (`/signup`): creates the auth user, the club tenant
  and the first committee membership, then signs the creator in. Rolls back the
  user if club creation fails; slugs are auto-deduplicated.
- **Member invites:** committee adds a person by email; the system generates a
  Supabase invite link and delivers it via Resend (Supabase's own emails stay
  off). Existing accounts (e.g. members of another chapter) are activated
  immediately instead of re-invited. Pending invites can be re-sent.
- **Set-password / accept-invite, password reset, and reset-via-link** flows.
- Middleware refreshes sessions and gates non-public routes; auth context is
  resolved once per request and cached.

### Lunch lifecycle & sign-ups

- **Venue pipeline:** candidate → tasting → approved → archived/rejected, with
  committee tasting notes and go/no-go outcomes.
- **Lunches** are created as **drafts** against a venue and **released** to
  members when ready. Capacity is a real-world booking input, never derived from
  sign-ups. Release computes the sign-up cutoff from the club default if unset.
- **Member sign-ups** are first-come-first-served against fixed capacity;
  guests consume seats from the same capacity. Beyond capacity, members are
  **waitlisted** and **auto-promoted** (strict FCFS) when seats free up.
- Members can adjust their guest party size or cancel (before the cutoff);
  cancelling/shrinking frees seats and triggers waitlist promotion.
- **Committee overrides:** add a member by hand (ignores cutoff; can force a
  seat beyond capacity), remove any sign-up, change capacity (raising
  auto-promotes; lowering never silently bumps confirmed attendees), move/clear
  the cutoff, cancel the whole lunch, mark attendance, and complete a lunch.
- Functions: `sign_up_for_lunch`, `update_my_guests`, `cancel_my_signup`,
  `promote_from_waitlist`, `committee_add_signup`, `committee_remove_signup`,
  `set_lunch_capacity`, `cancel_lunch`, `mark_attendance`, `lunch_seats_taken`,
  plus `update_my_profile` for self-service profile edits.

### Wine (back-of-house)

- Lightweight wine catalogue (cellar/restaurant source, no bottle-level
  inventory) and per-lunch Wine Master selections with pairing notes.
- Committee-only and **never member-facing** — blind tasting stays in the room.

### Notifications

- Transactional emails: invite, password reset, sign-up confirmed, waitlisted,
  promoted off the waitlist, lunch changed, lunch cancelled, and lunch reminder.
- Email failures are swallowed so they never break a member-facing flow.

### Scheduled jobs

- **Daily reminder cron** (`/api/cron/reminders`, registered in `vercel.json`,
  01:00 UTC ≈ 9am Singapore): emails confirmed attendees ~2 days before a lunch,
  once per lunch. Runs cross-tenant with the service role and is protected by
  `CRON_SECRET`.

### Application surface

- Club-scoped app under `/c/[club]/`: dashboard, lunches (list/detail/new/edit
  + sign-up card), members (roster/invite/detail/edit), venues (list/detail),
  wine, settings, and member profile.
- Server actions grouped by domain: `auth`, `members`, `lunches`, `venues`,
  `wine`, `settings`.

### Deployment & configuration

- Production-only data model (no local DB) — the app talks directly to a
  Supabase project. Schema applied via SQL editor or direct Postgres connection.
- Environment documented in `.env.example`: Supabase URL + publishable/secret
  API keys, Resend key + sender, app URL, and cron secret. Compatible with
  Supabase's current ECC (P-256) asymmetric API keys.
- Docs: `docs/vision.md` (scope) and `docs/architecture.md` (technical design).
