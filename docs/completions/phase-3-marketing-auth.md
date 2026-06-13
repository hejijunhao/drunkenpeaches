# Phase 3 — Marketing & auth surfaces — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓, `build` ✓ (all five auth
> pages + landing prerender as static where applicable).

Goal: first impressions — the landing page and every auth screen — look
intentional and on-brand.

## `components/auth-shell.tsx` (3.2, new)

Shared branded layout for **all five** auth screens. A centered form column on
the parchment canvas (wordmark + `ThemeToggle` top row, Fraunces `.text-h1`
title, muted description, form, footer-links slot) beside a **burgundy editorial
side panel** on `lg`+ — a serif pull-quote ("A society of friends, a serious
cellar…"), a product line, and soft gold/black radial glows for depth. Kept as a
server component (renders the client `ThemeToggle` as a child) to minimise client
JS. This is the one place the marketing wordmark lives (per the brand spec, the
in-club chrome shows the club's name instead).

## `app/page.tsx` — landing redesign (3.1)

- **Themed header/footer**: `border-border` + translucent `backdrop-blur` bar;
  Fraunces wordmark; `ThemeToggle` added next to Log in / Create your club.
- **Editorial hero**: an eyebrow pill, a Fraunces **`.text-display`** headline
  (clamped, text-balance), muted supporting copy, burgundy primary + outline
  CTAs, and a soft `bg-primary/5` radial behind it. Copy/tone unchanged.
- **Feature trio**: now `Card`s with `hover` lift, a burgundy-tinted icon tile
  (lucide `Users` / `ClipboardCheck` / `Wine`), Fraunces title, muted body.
- Every `bg-white` / `text-stone-*` replaced with tokens.

## `app/login`, `app/signup`, `app/auth/**` (3.3, 3.4)

- All five **pages** now wrap their form in `<AuthShell>` (login, signup, forgot,
  reset-password, set-password) → one consistent branded layout. Each page passes
  a `footer` slot for its cross-links (token-styled, burgundy hover).
- **Feedback consistency (3.3)**:
  - Login's `searchParams.error` now renders through the tokenized `FormError`
    (was a bespoke `bg-red-50` block).
  - Forgot-password **success** re-skinned to the `success` token set with a
    check icon (was `bg-emerald-50`), matching the error treatment.
  - All helper texts moved `text-stone-500` → `text-muted-foreground`.
- **Pending states**: every submit button switched from `disabled={pending}` to
  the Button's `loading={pending}` (spinner + label), so progress is uniform.
- **Signup delight (3.4)**: the create-a-club screen gets the full AuthShell
  brand panel treatment (it's the top-of-funnel), with its own footer link.

## Notes / decisions

- Chose a **shared component** (`AuthShell`) over a `(auth-shell)` route group —
  same result, no file moves, no routing churn (a non-goal of the plan).
- `ThemeToggle` works here because the root layout's `ThemeProvider` wraps all
  routes (Phase 0).
- Auth feedback that *replaces* the form (forgot success) stays inline; toast is
  reserved for in-app saves (Phases 6/9) where the form persists.

## Acceptance criteria — met

- ✅ Landing page reads as a 2026 SaaS marketing surface (editorial hero, depth,
  hover, theme toggle, both themes).
- ✅ All five auth screens share one branded layout; success vs error feedback is
  consistent and tokenized.
