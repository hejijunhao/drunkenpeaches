# Phase 10 — Motion, polish, accessibility & QA — ✅ Complete (code-level)

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓, `build` ✓ (22 routes),
> exhaustive grep sweeps clean.

The cross-cutting sweep that separates "restyled" from "top-tier."

## 10.1 — Motion pass
- Standardized transitions are in the primitives from Phase 1: button press
  (`active:scale-[0.98]`, `--duration-micro`/`--ease-out-quint`), card hover lift
  (`hover` → `-translate-y-0.5` + `shadow-lifted`), dialog/select/dropdown/toast
  entrances (base-ui `data-open` animations on `--duration-overlay`), skeleton
  shimmer (`animate-pulse`), mobile-nav slide-down, and the animated max-guests
  reveal on lunch/settings forms.
- **All motion is reduced-motion-safe** via the single global
  `@media (prefers-reduced-motion: reduce)` guard added in Phase 0 — so it covers
  every component without per-component work.

## 10.2 — Accessibility
- **Tokens engineered for AA**: dark `primary` lifted to `0.62 0.16 18`, status
  tones tuned to read as text on their own soft tint; `muted-foreground` chosen
  for ≥4.5:1 on card/background in both themes.
- **Focus-visible** everywhere via base-ui primitives + the burgundy `--ring`.
- **Dialog focus-trap / Escape**: handled by base-ui `Dialog` (used by
  `ConfirmDialog` and every modal).
- **Icon buttons labelled**: theme toggle (`aria-label="Toggle theme"`), mobile
  menu (`aria-label="Toggle menu"`), dialog close (`sr-only "Close"`).
- **Landmarks**: `<nav>` (AppNav) + `<main>` (club layout / auth shell).
- **Color never the only signal**: `StatusBadge` carries text **and** a dot;
  attended/no-show use tone badges with text.
- **Errors** use `role="alert"` (`FormError`/`ErrorBanner`).

## 10.3 — Responsive
- Built mobile-first throughout: `PageHeader` stacks, `DataList` reflows tables to
  cards under `sm`, nav collapses to a sheet, hero/detail headers go single-column
  on mobile and two-column on `md`+, forms use responsive grids, tap targets ≥
  the `h-9`/`size-icon` (36px) baseline.

## 10.4 — Dark-mode sweep
- Grep-clean across `app/` + `components/`: **no** `text-stone-*` / `bg-stone-*` /
  `text-red-[0-9]` / `text-emerald-[0-9]` / `text-blue-[0-9]` literals remain.
- Two **intentional** `bg-black/*` uses kept: the dialog scrim (`bg-black/10`) and
  the decorative glow on the always-burgundy `AuthShell` panel (`bg-black/20`) —
  both theme-safe by construction.
- `DropdownMenu` elevation migrated to `border + shadow-lifted` (was the old
  `ring-foreground/10`).

## 10.5 — Consistency lint
- Every in-app **index** page uses `PageHeader`; detail pages (lunch / member /
  venue / profile) use richer custom headers built on the same Fraunces
  `.text-h1` — an intentional, consistent exception.
- Empties → `EmptyState`; confirms → `ConfirmDialog`; in-place form successes →
  toast; **every** `<select>` is the `Select` primitive (grep: zero native
  selects, zero `window.confirm`).

## 10.6 — Performance
- Fonts load with `display: "swap"` (Geist + Fraunces) → no FOUT/CLS.
- Motion is transform/opacity-based; reduced-motion collapses it.

## 10.7 — Brand metadata
- `app/layout.tsx` metadata extended with `applicationName`, `keywords`,
  `openGraph`, and `twitter`. Wordmark verified across landing, auth shell, and
  nav (in-club chrome shows the club name per the brand spec).

## 10.8 — Docs
- `docs/architecture.md`: stack row updated + a new **Design system (UI)**
  section; limitations updated.
- `docs/CHANGELOG.md`: new **0.2.0** redesign entry.

## Honest verification scope
`tsc`, `lint`, `build`, and exhaustive grep sweeps all pass. What this
environment **cannot** do (no local DB / browser / Lighthouse): a live
pixel-level walkthrough at 375/768/1280, a runtime contrast scan, and a
Lighthouse run. Recommend a manual pass with `npm run dev` (or the `/run` /
`/verify` skills) against the Supabase project to confirm the live look in both
themes. The token system + grep-clean make regressions unlikely, but visual
sign-off is the one remaining step.

## Remaining known gaps (small, non-blocking)
- Per-field `aria-describedby` error association isn't wired (errors use
  `role="alert"` instead).
- Brand favicon / OG image are still placeholders (metadata fields are set; a
  designed asset is pending — out of scope for code-only work).
- Committee redirect/revalidate forms feed back via revalidated UI, not toasts
  (honoring the no-server-action-changes non-goal).

## Acceptance criteria — status
- ✅ No grayscale leftovers, no native selects, no `window.confirm`, no silent
  saves (verified by grep + build).
- ⏳ Full visual walkthrough in both themes at all breakpoints with reduced-motion
  on/off — recommended as a manual sign-off (not runnable headless here).
