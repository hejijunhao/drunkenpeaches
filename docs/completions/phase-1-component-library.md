# Phase 1 — Core component library — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `npx tsc --noEmit` ✓, `npm run lint` ✓, `npm run build` ✓.

Goal: every primitive a screen needs exists — themed, animated, accessible —
built on the Phase 0 tokens so every later phase just consumes them.

> **Stack note:** this app uses **base-ui** shadcn (`style: base-nova`), not the
> Radix variant. All primitives are `@base-ui/react/*` based. The plan's "base-ui
> vs shadcn Select/Dialog API" risk is settled here: we kept the existing base-ui
> `Select`/`Dialog` and built `ConfirmDialog` on top of them.

## 1A — Refined existing primitives

### `components/ui/button.tsx` (1.1)
- Default is burgundy `primary` with `shadow-soft` + `hover:bg-primary/90`.
- New **`gold`** variant (`bg-gold text-gold-foreground`) for wine/premium.
- `outline`/`ghost` re-pointed at the `accent` token (warm wash) instead of
  `muted`; `secondary` hover uses an oklch color-mix.
- **Press feedback** changed to `active:scale-[0.98]` (with `--duration-micro` /
  `--ease-out-quint`).
- **`loading` prop**: shows a spinning lucide `Loader2Icon` and disables the
  button (`disabled || loading`, plus `data-loading`). Powers every async CTA.
- Sizes bumped for comfort: default `h-9`, `lg` `h-10`, icon `size-9` — aligned
  with the new Input/Select height.

### `components/ui/card.tsx` (1.2)
- `ring-1 ring-foreground/10` → **`border border-border` + `shadow-soft`**;
  radius `rounded-xl` → **`rounded-2xl`** (header/footer/img corners too).
- New **`hover` prop**: adds a lift (`-translate-y-0.5` + `shadow-lifted`) for
  clickable cards.
- Card padding bumped (`--card-spacing` 4 → 5) for more generous rhythm.

### `components/ui/input.tsx` + `textarea.tsx` (1.3)
- Height `h-8` → `h-9`, padding `px-3`; burgundy focus ring inherited from the
  token `--ring`. Invalid state already token-driven; left intact.

### `components/ui/badge.tsx` (1.4)
- New **`tone`** variant (`success`/`warning`/`danger`/`neutral`/`info`) reading
  the Phase 0 status tokens as a soft tint (`bg-<tone>/12 text-<tone>
  border-<tone>/25`). Declared after `variant` so it cleanly overrides the
  default solid background via tailwind-merge.
- New **`dot` prop**: a leading `bg-current` dot (so color is never the only
  signal). Implemented by composing `children` through base-ui `mergeProps`.

### `components/ui/table.tsx` (1.5)
- Rounded, bordered, `shadow-soft` container (outer clips radius, inner scrolls
  on overflow) + optional `containerClassName`.
- Header is `bg-muted`; `<th>` is uppercase muted micro-label; cells `px-3 py-3`;
  rows hover on the warm `accent` token. Preps the responsive fallback (1.11).

### `components/ui/select.tsx` (1.6) + `dialog.tsx` polish
- Select trigger height aligned to `h-9`/`sm:h-8`, `pl-3`; popup elevation moved
  to `border + shadow-lifted`. (Select was already a real base-ui component — the
  native-`<select>` replacements happen in the screen phases.)
- Dialog content re-skinned to `rounded-2xl border + shadow-lifted`, `p-5`,
  overlay timing on `--duration-overlay`; footer negative-margins re-synced.

## 1B — New primitives & shared rewrites

### `lib/toast.ts` (1.7)
Thin helper over `sonner` (the `<Toaster>` was mounted in `app/layout.tsx` in
Phase 0, inside the ThemeProvider so it's theme-aware). Exports `toast` plus
`toastSuccess` / `toastError` / `toastInfo`. This is the standard success/error
channel that replaces "Saved ✓" text and silent successes in later phases.

### `components/confirm-dialog.tsx` (1.8, new)
Branded confirm modal — the `window.confirm()` replacement. Controlled
(`open`/`onOpenChange`) **or** uncontrolled (`trigger`) modes; `destructive`
tone, `loading` spinner, configurable labels.

### `components/confirm-submit.tsx` (1.8, rewrite)
Was `window.confirm()`. Now renders a `type="button"` trigger that opens a
`ConfirmDialog`; on confirm it locates the host `<form>` (captured from the click
event's `currentTarget.form`) and calls `requestSubmit()` — so all existing
`<form action={serverAction}>` call sites keep working unchanged, just with a
branded modal. API is a superset of before (`confirmMessage` + optional
`confirmTitle`/`confirmLabel`, all Button props).

### `components/empty-state.tsx` (1.9, new)
Icon + headline + supporting copy + optional action, dashed token border.
Replaces the scattered `text-muted-foreground`/`border-dashed` one-offs.

### `components/ui/skeleton.tsx` (1.10, new)
`animate-pulse bg-muted` placeholder. The per-route `loading.tsx` files are
created in their respective **screen phases** (4.5, 5.12, 6.5, 7.5, 8.3) where
the plan re-lists them, so each skeleton matches the layout it stands in for —
rather than building them twice. The shimmer respects reduced-motion via the
Phase 0 global guard.

### `components/data-list.tsx` (1.11, new)
`DataList<T>` — generic responsive table: a real `<table>` at `sm`+ and stacked
labelled cards below it (so no column is ever hidden on mobile). Columns can be
marked `primary` to render full-width without a label (identity column).
Consumed by Members (6.1) and Wine (8.1).

### `components/page-header.tsx` (1.12, new)
Fraunces `.text-h1` title + muted description + actions slot. The consistent
header for every in-app page.

### `components/seat-meter.tsx` (1.13, new)
Capacity bar: `taken / capacity seats`, burgundy fill, waitlist overflow chip,
**destructive fill when over capacity** (committee force-seating). `role=
progressbar` with aria values. For dashboard hero, lunch cards, lunch detail.

### `components/status-badge.tsx` (1.14, rewrite)
Rebuilt on `Badge` `tone` + `dot`. One `STATUS_TONE` map (status → tone) replaces
the old ad-hoc `bg-*-50/text-*-700` table; now fully theme-aware and AA-minded.

### `components/form-error.tsx` + `error-banner.tsx` (1.15, rewrite)
Re-skinned to token-driven `destructive` (`border-destructive/30
bg-destructive/10 text-destructive`) with a leading alert icon and `role="alert"`.

## Decisions & notes for later phases

- **Tone overrides variant.** `<Badge tone="success">` works even with the
  default solid `variant` because tone classes are emitted after variant classes;
  consumers don't need to also set `variant`.
- **ConfirmSubmit captures the form from the click event**, not a forwarded ref —
  robust regardless of base-ui ref behavior.
- **Destructive confirm = soft `destructive` Button variant** (consistent with
  the app's existing destructive treatment) rather than a new solid-red variant.
  Revisit in Phase 5 if action-bar emphasis wants more.
- **ThemeToggle is CSS-driven** (both icons render; `dark:` variant toggles
  visibility) — no `mounted` state, sidesteps the `react-hooks/set-state-in-effect`
  lint rule and any hydration mismatch.
- **loading.tsx route files deferred to screen phases** (see Skeleton note).

## Acceptance criteria — status

- ✅ Every primitive exists, themed for both modes, animated, token-driven.
- ✅ `ConfirmSubmit` no longer uses `window.confirm`. (The remaining
  `window.confirm` in `signup-card.tsx` and the 9 native `<select>`s are
  converted in their **screen phases** — 3/5/6/7/8 — per the plan; grep-clean is
  asserted in Phase 10.5/10. Primitives to do so all now exist.)
- ✅ New components are keyboard-accessible (base-ui primitives), focus-visible,
  and built on AA-minded tokens. Formal audit: Phase 10.
- ✅ `tsc` / `lint` / `build` green.

## Component inventory (Phase 1 surface)

Refined: `button`, `card`, `input`, `textarea`, `badge`, `table`, `select`,
`dialog`. New: `confirm-dialog`, `empty-state`, `data-list`, `page-header`,
`seat-meter`, `ui/skeleton`, `lib/toast`. Rewritten shared: `confirm-submit`,
`status-badge`, `form-error`, `error-banner`.
