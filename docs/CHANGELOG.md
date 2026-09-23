# Changelog

All notable changes to Drunken Peaches are recorded here. Newest first.

## Index

- **[0.4.0](#040--2026-09-23)** — Club stationery: engraved peach seal, Newsreader + Hanken Grotesk, hairline rules instead of shadows, stamp badges, ledger tables, two-column forms, chapter headings.
- **[0.3.0](#030--2026-09-23)** — Quiet-luxury members' club redesign: mobile-first shell, oxblood-on-paper tokens, club-secretary copy, peach emoji retired.
- **[0.2.0](#020--2026-06-13)** — Front-end redesign: "editorial wine-cellar" design system, light + dark themes, new component library, and a full screen-by-screen UI overhaul.
- **[0.1.0](#010--2026-06-13)** — Initial build: multi-tenant club lunch & member management (auth, members, venues, lunches, sign-ups/waitlist, wine, email, reminder cron).

---

## 0.4.0 — 2026-09-23

A full visual pass to take the front end from "tidy shadcn" to a members'
club's own stationery — the kind a London club would have printed. Front-end
only: no schema, RLS, server-action, or routing changes.

- **Seal.** A peach drawn as a single-weight engraving inside a double ring
  replaces the "P" square (`components/brand-mark.tsx`). The wordmark sets
  *Drunken* in italic — the one permitted joke. Sizes from `xs` to `hero`.
- **Type.** Newsreader (with the `opsz` axis and italics) for titles, numerals
  and asides; **Hanken Grotesk** replaces Source Sans 3 for the interface.
  New utilities: `.text-h3`, `.text-numeral`, `.text-aside`; `.text-display`
  and `.text-h1` drop to weight 400 for size.
- **Tokens.** Laid-cream paper, oxblood ink, brass accent; `--radius` 0.25rem
  (stationery corners); shadows retired at rest (`shadow-soft` is a hairline),
  kept for overlays. Dark mode: deep oxblood primary with cream text, not a
  lifted pink.
- **Rules.** `.club-rule-strong`, `.club-rule-double` (masthead), `.club-link`
  (hairline underline), `RuleLabel` (a small-cap label centred on a rule).
- **Primitives.** Button (flat oxblood, hairline outline, brass `gold`
  variant, text-only destructive), Card (hairline, small-cap `CardTitle` with a
  `serif` option), Badge (a stamp: letter-spaced caps, no fill), Input /
  Textarea / Select (hairline on card, ink on focus), Label (small caps),
  Table (ruled ledger, flush outer cells), Dialog, Avatar (roundel with serif
  initials), Skeleton.
- **Shared.** `PageHeader` (kicker, serif title, rule beneath, `aside` slot),
  `SectionHeading` (serif count), `FormSection`/`FormFooter` (two-column ruled
  forms), `LunchCard` (calendar tile + programme entry), `SeatMeter` (serif
  numeral, hairline track, "n remaining / n waiting / Full"), `StatusBadge`
  (club words: Open, Held, Waiting, Declined), `EmptyState` (with an italic
  `aside`), `DataList` (ruled on phones too), `PageHeaderSkeleton`/`RowsSkeleton`.
- **Chrome.** Masthead with small-cap links, roundel avatar and a double rule;
  phone rail in small caps; a "more" sheet with the member's name and role;
  a small-cap footer ("The book is kept.").
- **Screens.** Landing (display hero, hero seal, numbered notices, a line from
  the club history); auth (framed oxblood panel); notice board ("Good day,
  Philip.", ruled next-luncheon panel, committee figures in serif); lunch
  detail (definition-list meta, numbered list and waiting list, committee
  section under a rule label, "For the restaurant" copy block); members (the
  roll, "Propose a member"); venues (I / II / III pipeline); cellar (brass-framed
  "Record a wine"); settings, profile and member edit as sectioned forms.
- **Copy.** Cheek in the right places only: "Named, we are told, after an
  incident. The minutes do not record which."; "Patience is a club virtue.";
  "A situation the Wine Master will wish to correct."

---

## 0.3.0 — 2026-09-23

Visual and verbal polish for an exclusive private members' club — mobile-first.
No backend, auth, or routing changes.

- **Design system:** Newsreader (titles) + Source Sans 3 (UI); tighter radius;
  cream paper / oxblood accent; square initials; notice-board cards with a
  left rule; larger tap targets.
- **Chrome:** serif "P" monogram replaces the peach emoji; phone bottom tabs
  (Home / Lunches / Members / More); desktop keeps a quiet top nav.
- **Copy:** club-secretary tone on marketing, auth, dashboard, lunches, members,
  venues, wine, settings, profile, and member emails. Emoji removed from
  user-facing strings.

---

## 0.2.0 — 2026-06-13

A complete **front-end redesign** — turning the stock-grayscale shadcn build into
a branded, top-tier 2026 product. **Front-end only**: no changes to the data
model, RLS, SQL functions, or server actions. Implemented in phases; detailed
per-phase notes in [`docs/completions/`](./completions/).

### Design foundation (Phase 0)

- **"Editorial wine-cellar" tokens** in `app/globals.css` — burgundy/oxblood +
  parchment/cream in OKLCH, full **light + dark** themes, a `--gold` premium
  accent, a semantic status set (success/warning/danger/neutral/info), two-tier
  warm `shadow-soft`/`shadow-lifted`, motion tokens, and a global
  `prefers-reduced-motion` guard.
- **Fraunces** display serif (via `next/font`) for headings; Geist kept for body.
- **`next-themes`** wired (`ThemeProvider`, `ThemeToggle`); body de-hardcoded to
  the token-driven canvas.

### Component library (Phase 1)

- Refined Button (`loading`, `gold` variant), Card (`hover`), Badge (`tone` +
  `dot`), Input/Textarea, Table, Select, Dialog.
- New: `PageHeader`, `EmptyState`, `SeatMeter`, `DataList` (responsive
  table→cards), `Skeleton`, `ConfirmDialog` (+ rewritten `ConfirmSubmit`),
  `LunchCard`, `AttendanceHistory`, `CopyButton`, `AuthShell`, toast helpers.
- `StatusBadge`/`FormError`/`ErrorBanner` rebuilt on tokens.

### Screen overhaul (Phases 2–9)

- **App shell**: token-driven sticky nav, burgundy active state, theme toggle +
  dropdown user menu, animated mobile sheet.
- **Marketing & auth**: editorial landing hero; one branded `AuthShell` across
  login/signup/forgot/reset/set-password.
- **Dashboard**: next-lunch hero with a seat meter, refined "coming up" cards,
  committee stat tiles.
- **Lunches**: refined list, editorial detail header, three-state SignupCard,
  organized committee control room, polished create/edit form.
- **Members**: CRM-style roster (responsive DataList, avatars), Select-based
  invite/edit, shared attendance timeline, remove-confirm.
- **Venues**: kanban pipeline with an add-venue dialog; sectioned detail with a
  status toolbar and tidy tastings.
- **Wine**: gold-accented catalogue (DataList), cleaner add form.
- **Settings & profile**: grouped setting cards, avatar profile header, toasts,
  a theme preference row.

### Cross-cutting (Phase 10)

- Standardized motion (all reduced-motion safe), AA-minded tokens, icon-button
  labels, `loading.tsx` skeletons for data-heavy routes.
- Zero native `<select>` and zero `window.confirm` remain; every success uses a
  toast or revalidated UI; OpenGraph/Twitter metadata added.

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
