# Frontend Redesign — "Editorial Wine-Cellar" (2026)

> Status: **Proposed** · Author: design pass, 2026-06-13
> Companion to [vision.md](../vision.md) and [architecture.md](../architecture.md).

## Why this exists

Drunken Peaches is functionally complete but visually it is **stock shadcn with
no identity** — a pure-grayscale palette (`oklch(… 0 0)`, literally zero chroma),
the default Geist font, default radius, flat cards, a plain top nav, native
`<select>`s, `window.confirm()` dialogs, and text-only feedback. For a private
gentlemen's **wine & dining club** this is a wasted opportunity and, frankly,
looks worse than the WildApricot it replaces.

This plan overhauls the **entire** front end into something that feels like a
top-tier 2026 consumer app: an **editorial wine-cellar** aesthetic — warm,
refined, members'-club confidence — with full light **and** dark themes, a real
component system, and the interaction polish (toasts, modals, loading/empty
states, motion) that separates "a tool" from "a product you enjoy using."

### Decisions locked (2026-06-13)

| Decision | Choice |
| --- | --- |
| **Aesthetic** | Editorial wine-cellar — burgundy/oxblood + cream/parchment, serif display headings, clean sans body |
| **Themes** | Light **and** dark, with a toggle in the nav |
| **Scope** | Visual **+** UX patterns — new primitives (Select, Toast, Modal, EmptyState, Skeleton), loading states, mobile tables, motion |

### Non-goals

- No changes to data model, server actions, SQL functions, RLS, or business
  logic. This is a **front-end-only** overhaul. Where a screen's *data* needs to
  change to support a UI affordance, it is called out explicitly and kept minimal.
- No new product features (no new pages/flows beyond what exists today).
- No routing/URL changes.

### Guiding principles

1. **Tokens, never hardcoded colors.** Every `text-stone-600`, `bg-white`,
   `text-red-600` becomes a semantic token (`text-muted-foreground`, `bg-card`,
   `text-destructive`). This is what makes dark mode and future re-skins trivial.
2. **One component does one job, everywhere.** A `<Select>` is the select, full
   stop — no more inline-styled native `<select>`. Same for confirms, badges,
   empty states.
3. **Editorial restraint.** Serif display for moments that matter (page titles,
   the "next lunch" hero); clean sans for everything functional. Color is an
   accent, not wallpaper — burgundy earns attention, it doesn't shout.
4. **Mobile-first and fast.** Members sign up on phones. Every screen verified at
   375px. Motion is subtle and respects `prefers-reduced-motion`.
5. **Ship screen-by-screen.** After Phase 1, every later phase is independently
   shippable and reviewable. No big-bang merge.

---

## Design language specification

This is the contract the whole redesign builds against. Phase 0 encodes it in
code; everything after consumes it.

### Brand

- **Name lockup:** "🍑 Drunken Peaches" → refined wordmark. Keep the peach as a
  small mark but pair it with a serif wordmark. In-club, the chrome shows the
  **club's** name (e.g. *Beefsteaks & Burgundy*) — the wordmark is for marketing/auth.
- **Voice:** confident, dry, a little clubby. Existing copy ("without the 2007
  clunk", "be first!") is on-brand — keep that tone, just dress it better.

### Color — light theme

Defined as OKLCH CSS variables in `app/globals.css`. Burgundy is the primary;
parchment/cream is the canvas; ink is near-black with a warm tint.

| Token | Role | Value (approx OKLCH) | Note |
| --- | --- | --- | --- |
| `--background` | App canvas | `0.985 0.006 70` | warm parchment, not pure white |
| `--foreground` | Primary text | `0.22 0.02 40` | warm near-black ink |
| `--card` | Card surface | `1 0 0` | crisp white panels on parchment |
| `--card-foreground` | Text on card | = foreground | |
| `--primary` | Burgundy / actions | `0.38 0.13 18` | oxblood; CTA, links, active nav |
| `--primary-foreground` | Text on burgundy | `0.97 0.01 80` | cream |
| `--secondary` | Soft fill | `0.95 0.012 70` | muted parchment for chips/secondary btns |
| `--muted` | Subtle bg | `0.96 0.008 70` | table headers, inset panels |
| `--muted-foreground` | Secondary text | `0.50 0.015 50` | replaces every `text-stone-500/600` |
| `--accent` | Hover/active wash | `0.93 0.02 60` | nav hover, row hover |
| `--border` | Hairlines | `0.90 0.01 70` | warm, not gray |
| `--input` | Field border | = border | |
| `--ring` | Focus ring | = primary at lower chroma | burgundy-tinted focus |
| `--destructive` | Errors/danger | `0.55 0.20 27` | keep red, warm it slightly |
| `--gold` | Wine-master / premium accent | `0.78 0.11 85` | sparingly; wine screens, "completed" |
| `--radius` | Base radius | `0.75rem` | softer than current 0.625 |

### Color — dark theme

A genuine dark wine-cellar, not inverted gray. Deep warm charcoal/aubergine
canvas, parchment text, burgundy lifted for contrast.

| Token | Value (approx OKLCH) | Note |
| --- | --- | --- |
| `--background` | `0.18 0.012 30` | warm near-black, faint aubergine |
| `--foreground` | `0.94 0.01 80` | parchment text |
| `--card` | `0.22 0.014 30` | raised panel |
| `--primary` | `0.62 0.16 18` | brighter burgundy for AA contrast on dark |
| `--primary-foreground` | `0.16 0.01 30` | |
| `--muted-foreground` | `0.70 0.012 70` | |
| `--border` | `1 0 0 / 10%` | |
| `--gold` | `0.80 0.12 85` | |

> **Acceptance:** all token pairs (`foreground`/`background`, `primary`/
> `primary-foreground`, `muted-foreground`/`card`) meet **WCAG AA** (≥4.5:1 for
> body text, ≥3:1 for large text and UI). Verify in Phase 10.

### Status color system

Today `status-badge.tsx` maps statuses to ad-hoc `bg-*-50/text-*-700` tints.
Replace with a **single semantic token set** used by badges, dots, and banners
alike, theme-aware in both modes:

| Semantic | Used by | Light | Dark |
| --- | --- | --- | --- |
| `success` | released, confirmed, active, approved, go | emerald, warmed | lifted emerald |
| `warning` | waitlisted, invited, tasting, pending | amber | lifted amber |
| `danger` | cancelled, removed, rejected, no_go | = destructive | |
| `neutral` | draft, resigned, lapsed, archived, candidate | muted | |
| `info` | completed | burgundy or gold | |

Encode as `--color-success`, `--color-success-foreground`, etc. so a `<Badge
tone="success">` and an alert share one source of truth.

### Typography

- **Display / headings:** **Fraunces** (variable serif, has optical sizing and a
  "soft"/wonky axis perfect for editorial warmth). Loaded via `next/font/google`.
  Used for: page `<h1>`s, the dashboard hero, marketing headline, section titles
  where it adds character.
- **Body / UI:** keep **Geist Sans** (already loaded, excellent) for all
  functional text, forms, tables, nav.
- **Mono:** Geist Mono — keep, used for the restaurant dietary list block.
- **Type scale** (encode as a small set, stop free-handing sizes):
  - `display`: Fraunces, clamp 2.25→3.25rem, tight leading — hero only
  - `h1`: Fraunces 1.875rem
  - `h2`: Fraunces 1.25rem
  - `h3`/card titles: Geist 1rem semibold
  - `body`: 0.9375rem
  - `small`/meta: 0.8125rem
  - `caption`: 0.75rem
- Map `--font-heading` → Fraunces in the `@theme` block (currently it points at
  `--font-sans`).

### Spacing, elevation, motion

- **Spacing:** standardize page rhythm on `space-y-8` for page sections,
  `space-y-6` within sections, `space-y-2` within field groups. Generous page
  padding; widen comfortable reading column.
- **Radius:** `--radius: 0.75rem`; cards `rounded-2xl`, inputs/buttons
  `rounded-lg`, chips `rounded-full`.
- **Elevation:** two-tier shadow system — `shadow-soft` (resting cards: tiny,
  warm-tinted) and `shadow-lifted` (hover/popovers/modals). Replace the current
  `ring-1 ring-foreground/10` card border with a softer border + `shadow-soft`.
- **Motion:** `tw-animate-css` is already installed. Standardize:
  - durations: `150ms` (micro), `220ms` (default), `300ms` (overlays)
  - easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) for entrances
  - patterns: button press scale, card hover lift, dialog/sheet fade+scale, toast
    slide-in, skeleton shimmer, page-section stagger on first paint
  - **All motion gated behind `prefers-reduced-motion`.**

---

## Phase 0 — Design foundation (tokens, fonts, theming)

**Goal:** the design language exists in code and the whole app inherits it. No
screen looks final yet, but nothing is grayscale and dark mode toggles.

| # | Task | Files |
| --- | --- | --- |
| 0.1 | Replace the grayscale `:root` and `.dark` blocks with the full burgundy/parchment token sets (light + dark) above. Add `--gold`, status tokens, `shadow-soft`/`shadow-lifted`. | `app/globals.css` |
| 0.2 | Add status-color tokens to the `@theme inline` block so `bg-success`, `text-warning-foreground`, etc. are real utilities. Point `--font-heading` at Fraunces. | `app/globals.css` |
| 0.3 | Load **Fraunces** via `next/font/google` (variable, with `--font-heading` CSS var); keep Geist Sans/Mono. | `app/layout.tsx` |
| 0.4 | **Remove the hardcoded `bg-stone-50 text-stone-900` on `<body>`** — use `bg-background text-foreground` so the theme actually drives the canvas. Add `suppressHydrationWarning` for theme. | `app/layout.tsx` |
| 0.5 | Wire `next-themes` (already a dependency): add a `ThemeProvider` client wrapper around the app; `class` strategy, default `system`. | `app/layout.tsx`, new `components/theme-provider.tsx` |
| 0.6 | Build a `ThemeToggle` component (sun/moon, lucide) — placed in nav in Phase 2. | new `components/theme-toggle.tsx` |
| 0.7 | Add typography utility classes / a small `<Heading>`/`<Display>` convention (or `@layer` classes `.text-display`, `.font-heading`) so headings consistently use Fraunces. | `app/globals.css` |

**Acceptance criteria**
- Toggling theme flips the entire app between warm-light and warm-dark with no
  grayscale `stone-*` leaking through the body/shell.
- Fraunces renders on at least one visible heading; no FOUT/CLS regression.
- `prefers-color-scheme` respected on first load; choice persists across reloads.

---

## Phase 1 — Core component library

**Goal:** every primitive a screen needs exists, themed, animated, and
accessible. This is the foundation every later phase consumes — do it well.

### 1A. Refine existing primitives

| # | Task | Files |
| --- | --- | --- |
| 1.1 | **Button** — verify all variants read from tokens; add burgundy `primary` as default, a `gold`/premium variant, refined `ghost`/`outline`; add press-scale + focus-ring polish; ensure a built-in pending/spinner state (`loading` prop with lucide `Loader2`). | `components/ui/button.tsx` |
| 1.2 | **Card** — swap `ring-1 ring-foreground/10` for `border + shadow-soft`; add optional `hover` lift variant; `rounded-2xl`. | `components/ui/card.tsx` |
| 1.3 | **Input / Textarea** — token-driven borders, burgundy focus ring, comfortable height; consistent invalid state. | `components/ui/input.tsx`, `components/ui/textarea.tsx` |
| 1.4 | **Badge** → drive from the status token system; add `tone` prop (`success`/`warning`/`danger`/`neutral`/`info`) and an optional leading dot. | `components/ui/badge.tsx` |
| 1.5 | **Table** — themed header (`bg-muted`), warm row hover, comfortable padding, rounded container; prep for the responsive card-fallback (1.11). | `components/ui/table.tsx` |

### 1B. New primitives (the "UX patterns" scope)

| # | Task | Files |
| --- | --- | --- |
| 1.6 | **Select** — real component (base-ui is already a dependency, or shadcn select). Replaces **every** inline-styled native `<select>` in lunch-form, member-edit-form, venue-form, wine-form, settings, and the lunch-detail add-member/add-wine forms. | new `components/ui/select.tsx` |
| 1.7 | **Toast** — `sonner` is already installed. Add `<Toaster>` to the root (themed), and a thin helper. Standardize success/error feedback (replaces "Saved ✓" text and silent successes). | `app/layout.tsx`, `components/ui/sonner.tsx` (exists), new `lib/toast.ts` |
| 1.8 | **ConfirmDialog** — replace `window.confirm()` (in `confirm-submit.tsx` and the signup-card cancel) with a branded modal (`dialog.tsx` exists). Keep the server-action `form action` ergonomics; the dialog gates submission. Title/description/confirm-label/destructive-tone API. | rewrite `components/confirm-submit.tsx`, new `components/confirm-dialog.tsx` |
| 1.9 | **EmptyState** — icon + headline + supporting copy + optional action. Replaces the scattered `text-stone-500` / `border-dashed` empty messages (dashboard, lunches, members, venues, wine, attendance). | new `components/empty-state.tsx` |
| 1.10 | **Skeleton** + loading conventions — skeleton component plus `loading.tsx` route files for the data-heavy pages (dashboard, lunches list, lunch detail, members, venues). | new `components/ui/skeleton.tsx`, `app/c/[club]/**/loading.tsx` |
| 1.11 | **ResponsiveTable / DataList** — pattern so tables (members, wine) reflow into stacked cards under `sm` instead of hiding columns. Either a wrapper or a documented dual-render pattern. | new `components/data-list.tsx` (or extend table) |
| 1.12 | **PageHeader** — standard title (Fraunces) + description + actions slot, used by every in-app page for consistent rhythm. | new `components/page-header.tsx` |
| 1.13 | **StatProgress / SeatMeter** — a small capacity bar (e.g. `32/40` with a burgundy fill + waitlist overflow indicator) for dashboard hero, lunch cards, and lunch detail. | new `components/seat-meter.tsx` |
| 1.14 | **StatusBadge** — rebuild on the new `Badge` `tone` system; one map from status → tone + label. | `components/status-badge.tsx` |
| 1.15 | **FormError / ErrorBanner** — re-skin to token-driven `destructive` styling; align with toast usage. | `components/form-error.tsx`, `components/error-banner.tsx` |

**Acceptance criteria**
- A component gallery (informal — e.g. exercised across the rebuilt screens)
  shows every primitive in both themes.
- Zero native `<select>` elements remain in the codebase (grep clean).
- Zero `window.confirm` / `window.alert` remain (grep clean).
- All new components keyboard-accessible, focus-visible, and AA-contrast.

---

## Phase 2 — App shell & navigation

**Goal:** the frame around every screen feels like a product, not a header bar.

| # | Task | Files |
| --- | --- | --- |
| 2.1 | Redesign `AppNav`: token-driven (kill `bg-white`/`hover:bg-stone-100`/`text-stone-600`), burgundy active state, refined club lockup, comfortable height, subtle bottom border + blur on sticky. | `components/app-nav.tsx` |
| 2.2 | Add the **ThemeToggle** and a proper **user menu** (avatar/initials → profile, sign out) via `dropdown-menu.tsx` instead of the loose link + sign-out form. | `components/app-nav.tsx` |
| 2.3 | Rework the **mobile nav**: animated slide-down/sheet, larger tap targets, theme toggle + user actions inside; ensure the menu icon transition is smooth. | `components/app-nav.tsx` |
| 2.4 | Club layout: set a comfortable max-width/padding rhythm; ensure the `<main>` background is the parchment canvas with proper vertical rhythm. | `app/c/[club]/layout.tsx` |
| 2.5 | (Nice-to-have) Show a wine-master "hat" indicator and committee chip subtly in the nav/user menu. | `components/app-nav.tsx` |

**Acceptance criteria**
- Active route is unmistakable (burgundy) in both themes.
- Mobile menu is smooth, fully usable at 375px, includes theme + sign out.
- No hardcoded stone/white colors remain in the shell.

---

## Phase 3 — Marketing & auth surfaces

**Goal:** first impressions — the landing page and every auth screen — look
intentional and on-brand.

| # | Task | Files |
| --- | --- | --- |
| 3.1 | **Landing page** redesign: editorial hero (Fraunces display headline, parchment canvas, burgundy CTA), refined feature trio (icons, depth, hover), themed header/footer, theme toggle. Keep existing copy/tone. | `app/page.tsx` |
| 3.2 | **Auth shell**: a shared, branded auth layout (centered card on a warm/textured canvas, wordmark, optional side panel with a clubby illustration/quote on desktop). | new `app/(auth-shell)` pattern or shared component used by login/signup/forgot/reset/set-password |
| 3.3 | Re-skin **login**, **signup**, **set-password**, **forgot**, **reset-password** forms onto the new primitives; toast/inline feedback; consistent success vs error states (fix the inline-text vs banner inconsistency). | `app/login/*`, `app/signup/*`, `app/auth/**/*` |
| 3.4 | Signup (create-a-club) gets a touch more delight — it's the top-of-funnel for the SaaS ambition. | `app/signup/signup-form.tsx` |

**Acceptance criteria**
- Landing page would not look out of place next to a 2026 SaaS marketing site.
- All five auth screens share one branded layout; feedback is consistent.

---

## Phase 4 — Dashboard

**Goal:** the screen members and committee see first, every time. Make the "next
lunch" a genuine hero.

| # | Task | Files |
| --- | --- | --- |
| 4.1 | **Next-lunch hero**: Fraunces title, date/venue, **SeatMeter** (1.13), prominent burgundy CTA, member's own status surfaced clearly; warm card with `shadow-soft`. | `app/c/[club]/dashboard/page.tsx` |
| 4.2 | **"Coming up"** grid: refined lunch cards (status badge, date, venue, seat meter), hover lift, consistent with the lunches list cards. | `app/c/[club]/dashboard/page.tsx` |
| 4.3 | **Committee stat tiles** (pipeline count, active members): proper stat cards with icon + Fraunces numeral + label, hover, link affordance. | `app/c/[club]/dashboard/page.tsx` |
| 4.4 | Empty state via `EmptyState` (replaces the `py-10 text-center text-stone-500`). | `app/c/[club]/dashboard/page.tsx` |
| 4.5 | Add `loading.tsx` skeleton. | `app/c/[club]/dashboard/loading.tsx` |

**Acceptance criteria**
- The next lunch reads as the focal point; CTA is obvious; seat status legible
  at a glance. Polished in both themes and at 375px.

---

## Phase 5 — Lunches (the heart of the product)

**Goal:** the core flow — browse, sign up, manage, and the committee control
room — is excellent. Highest-value phase; budget the most care here.

### 5A. Member-facing

| # | Task | Files |
| --- | --- | --- |
| 5.1 | **Lunches list**: upcoming vs past sections with refined cards (PageHeader, status + personal badges, SeatMeter, hover lift); `EmptyState`s. | `app/c/[club]/lunches/page.tsx` |
| 5.2 | **Lunch detail header**: editorial title (Fraunces), date/venue/cutoff metadata hierarchy, the big `taken/capacity` figure rebuilt as a proper SeatMeter + over-capacity warning in `destructive` tone. | `app/c/[club]/lunches/[id]/page.tsx` |
| 5.3 | **SignupCard** redesign: the three states (sign up / you're in / cutoff passed) as distinct, confident cards; guest controls polished; **ConfirmDialog** for cancel (replace `window.confirm`); button `loading` states; will-waitlist hint styled. | `app/c/[club]/lunches/[id]/signup-card.tsx` |
| 5.4 | **Confirmed / Waitlist lists**: turn into clean roster rows with avatars/initials, guest pills, "added by committee" tag styled, ordinal waitlist; `EmptyState`s. | `app/c/[club]/lunches/[id]/page.tsx` |

### 5B. Committee control room (same page, committee-only sections)

| # | Task | Files |
| --- | --- | --- |
| 5.5 | **Action bar** (release / edit / complete / cancel / delete): group into a coherent toolbar with clear primary vs destructive treatment; all confirms via `ConfirmDialog`. | `app/c/[club]/lunches/[id]/page.tsx` |
| 5.6 | **Capacity & cutoff** cards: re-skin, Select/Input on new primitives, toast on save, helper copy in `muted-foreground`. | `app/c/[club]/lunches/[id]/page.tsx` |
| 5.7 | **Manually add member**: replace native `<select>` with `Select`; tidy the inline form into a clean row/grid; `Checkbox` for force-seat. | `app/c/[club]/lunches/[id]/page.tsx` |
| 5.8 | **Restaurant dietary list**: keep the mono "export" block but frame it as a deliberate "copy for the restaurant" panel (mono on `muted`, a copy-to-clipboard button + toast). | `app/c/[club]/lunches/[id]/page.tsx` |
| 5.9 | **Wine-master corner**: re-skin with gold accent; `Select` for wine pick; pairing list as refined rows; remove `text-red-600` ad-hoc styling. | `app/c/[club]/lunches/[id]/page.tsx` |

### 5C. Lunch create/edit form

| # | Task | Files |
| --- | --- | --- |
| 5.10 | **LunchForm**: all fields on new primitives (`Select` for venue, real date/time fields, `Textarea` for notes, `Switch` for guests-allowed with conditional max-guests); two-column responsive grid; helper text in tokens; toast + redirect on success; disabled-capacity-on-edit gets a clear explanatory affordance. | `app/c/[club]/lunches/lunch-form.tsx` |
| 5.11 | **new** / **edit** wrappers: PageHeader + intro copy, consistent container. | `app/c/[club]/lunches/new/page.tsx`, `app/c/[club]/lunches/[id]/edit/page.tsx` |
| 5.12 | `loading.tsx` skeletons for list + detail. | `app/c/[club]/lunches/loading.tsx`, `app/c/[club]/lunches/[id]/loading.tsx` |

**Acceptance criteria**
- A member can find the next lunch, understand seat/waitlist status, and sign
  up/cancel with confident, delightful feedback — on a phone.
- The committee control room reads as organized, not a wall of forms; every
  destructive action is a branded confirm; saves toast.
- No native selects or `window.confirm` anywhere in the lunches area.

---

## Phase 6 — Members

**Goal:** roster, invite, and member profiles feel like a CRM, not a spreadsheet.

| # | Task | Files |
| --- | --- | --- |
| 6.1 | **Roster**: PageHeader + count; convert the responsive-hide table into a **ResponsiveTable/DataList** that reflows to cards on mobile; avatars/initials; status badges; row actions (resend invite, edit) as a tidy menu or buttons. | `app/c/[club]/members/page.tsx` |
| 6.2 | **InviteForm**: stop the awkward `flex flex-wrap` + min-widths; rebuild as a clean responsive grid (or a "Invite member" dialog/sheet); `Select` for role; toast on success (replaces ref-clear-on-success hack). | `app/c/[club]/members/invite-form.tsx` |
| 6.3 | **Member detail**: header with avatar + status; edit form on new primitives; **attendance history** as a clean timeline/list with success/danger tones from tokens (replace ad-hoc `text-emerald-700`/`text-red-600`). | `app/c/[club]/members/[id]/page.tsx` |
| 6.4 | **MemberEditForm**: `Select` for role/status, `Switch` (or styled Checkbox) for wine-master, read-only email as a styled static field (not a disabled input), confirm on destructive status changes (e.g. remove); toast. | `app/c/[club]/members/[id]/member-edit-form.tsx` |
| 6.5 | `loading.tsx` skeleton for roster. | `app/c/[club]/members/loading.tsx` |

**Acceptance criteria**
- Roster is fully usable on mobile (no hidden-data dead-ends).
- Invite flow gives clear success feedback; role/status use real Selects.

---

## Phase 7 — Venues & tastings (back-of-house)

**Goal:** the pipeline — the differentiator vs WildApricot — looks like a
deliberate kanban, and the venue detail page stops being a wall of inline forms.

| # | Task | Files |
| --- | --- | --- |
| 7.1 | **Venue pipeline**: redesign the three-stage grid as a proper **kanban-ish board** (candidate / tasting / approved) with column headers + counts, refined venue cards, dashed `EmptyState` per column on the new system; retired venues in a collapsible/muted shelf. | `app/c/[club]/venues/page.tsx` |
| 7.2 | **AddVenue**: move the bottom-of-page card into an "Add venue" dialog/sheet (or a clearly-framed panel); new primitives; toast. | `app/c/[club]/venues/page.tsx`, `app/c/[club]/venues/venue-form.tsx` |
| 7.3 | **Venue detail**: restructure into clear sections (Details / Tastings / Lunches here) with PageHeader + status + a status-transition toolbar (candidate→tasting→approved→book, reject/archive) using clear primary/destructive treatment and `ConfirmDialog`. | `app/c/[club]/venues/[id]/page.tsx` |
| 7.4 | **Tastings**: turn the cramped inline `flex flex-wrap` add/edit forms into tidy tasting cards + an "Add tasting" form/dialog; `Select` for go/no-go outcome; `Textarea` for feedback; toast on save. | `app/c/[club]/venues/[id]/page.tsx` |
| 7.5 | `loading.tsx` skeleton for pipeline + detail. | `app/c/[club]/venues/loading.tsx`, `app/c/[club]/venues/[id]/loading.tsx` |

**Acceptance criteria**
- Pipeline reads as a board; venue lifecycle transitions are obvious and
  confirmed; tasting capture is comfortable on mobile.

---

## Phase 8 — Wine (back-of-house)

**Goal:** the cellar catalogue gets the gold-accented, slightly indulgent
treatment the subject deserves — while staying lightweight.

| # | Task | Files |
| --- | --- | --- |
| 8.1 | **Wine catalogue**: PageHeader; convert the table to ResponsiveTable/DataList (name, vintage, source pill cellar/restaurant, notes); gold accent touches; `EmptyState`; delete via `ConfirmDialog` + toast. | `app/c/[club]/wine/page.tsx` |
| 8.2 | **WineForm**: fix the awkward mixed flex widths; clean responsive grid (or "Add wine" dialog); `Select` for source/vintage; toast on add. | `app/c/[club]/wine/wine-form.tsx` |
| 8.3 | `loading.tsx` skeleton. | `app/c/[club]/wine/loading.tsx` |

**Acceptance criteria**
- Catalogue is pleasant on mobile; add/delete give clear feedback.

---

## Phase 9 — Settings & profile

**Goal:** account/club configuration feels considered and consistent.

| # | Task | Files |
| --- | --- | --- |
| 9.1 | **Club settings**: PageHeader; settings grouped into titled cards (Identity, Sign-ups, Guests); `Switch` rows polished; conditional max-guests reveal animated; toast on save (replace any inline feedback). | `app/c/[club]/settings/page.tsx`, `settings-form.tsx` |
| 9.2 | **Profile**: header with avatar + member-since/role/wine-master chips; edit form on new primitives; read-only email as styled static field; **toast** replaces the inline "Saved ✓"; attendance history matches member-detail treatment (6.3). | `app/c/[club]/profile/page.tsx`, `profile-form.tsx` |
| 9.3 | Add the theme toggle here too (in addition to nav) as a labeled preference row. | `app/c/[club]/profile/profile-form.tsx` |

**Acceptance criteria**
- Settings/profile saves toast; toggles animate; both themes clean.

---

## Phase 10 — Motion, polish, accessibility & QA

**Goal:** the difference between "restyled" and "top-tier." Cross-cutting sweep.

| # | Task |
| --- | --- |
| 10.1 | **Motion pass**: apply the standardized transitions (button press, card hover lift, dialog/sheet/toast entrances, skeleton shimmer, section stagger on dashboard/landing). Verify all respect `prefers-reduced-motion`. |
| 10.2 | **Accessibility audit**: AA contrast on every token pair (light + dark), focus-visible on all interactive elements, dialog focus-trap/escape, `aria-label`s on icon buttons, form error association (`aria-describedby`), landmark regions (`<nav>`/`<main>`), color never the only signal (status badges keep text + dot). |
| 10.3 | **Responsive sweep**: every screen at 375 / 768 / 1280px. Tables reflow, nav works, no overflow, tap targets ≥44px. |
| 10.4 | **Dark-mode sweep**: walk every screen in dark; catch any hardcoded color that slipped through. `grep` for residual `stone-/white/black/-50/-100/text-red-600`-style literals and convert to tokens. |
| 10.5 | **Consistency lint**: confirm every page uses PageHeader, every empty state uses EmptyState, every confirm uses ConfirmDialog, every success uses toast, every select is `Select`. |
| 10.6 | **Performance**: font loading (display swap, no CLS), no layout thrash from motion, Lighthouse pass on landing + dashboard. |
| 10.7 | Update `metadata`/favicon/og to the refined brand; verify the wordmark everywhere. |
| 10.8 | Update `docs/architecture.md` (UI section) and `docs/CHANGELOG.md` with the redesign. |

**Acceptance criteria**
- Full walkthrough in both themes, at all breakpoints, with reduced-motion on and
  off, shows a coherent, polished, branded product. No grayscale leftovers, no
  native selects, no `window.confirm`, no silent saves.

---

## Execution notes

- **Order matters:** Phases 0 → 1 are prerequisites for everything. After that,
  Phases 3–9 are independent and can be reordered, but **Phase 5 (Lunches) is the
  highest-value** — do it early among the screen phases.
- **Each phase = one reviewable PR** (or a small stack). Keep the app shippable
  throughout; a half-redesigned app should still look intentional because the
  tokens (Phase 0) already unify it.
- **Definition of done per screen:** uses tokens only (no hardcoded colors);
  uses the shared primitives (PageHeader/EmptyState/Select/ConfirmDialog/toast);
  has a loading state; verified in light + dark at 375/768/1280; reduced-motion
  safe.
- **Risk to watch:** base-ui vs shadcn select/dialog API differences — settle the
  Select/Dialog implementation in Phase 1 before consuming it widely.
- **No backend changes.** If a UI affordance (e.g. avatars) wants data we don't
  store, derive it client-side (initials) rather than touch the schema.

## File inventory (touched by this plan)

**Foundation/shared:** `app/globals.css`, `app/layout.tsx`,
`components/theme-provider.tsx`*, `components/theme-toggle.tsx`*,
`components/page-header.tsx`*, `components/empty-state.tsx`*,
`components/confirm-dialog.tsx`*, `components/data-list.tsx`*,
`components/seat-meter.tsx`*, `components/status-badge.tsx`,
`components/confirm-submit.tsx`, `components/form-error.tsx`,
`components/error-banner.tsx`, `components/app-nav.tsx`, `lib/toast.ts`*

**UI primitives:** `components/ui/{button,card,input,textarea,badge,table,select*,skeleton*,sonner,dialog,switch,checkbox}.tsx`

**Screens:** `app/page.tsx`, `app/login/*`, `app/signup/*`, `app/auth/**/*`,
`app/c/[club]/layout.tsx`, and every page under
`app/c/[club]/{dashboard,lunches,members,venues,wine,settings,profile}/**`, plus
new `loading.tsx` files.

`*` = new file.
