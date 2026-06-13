# Phase 0 — Design foundation (tokens, fonts, theming) — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `npm run build` ✓, `npx tsc --noEmit` ✓.

## Why this had to come first

The plan lists Phase 1 (component library) as the headline ask, but states
plainly that **"Phases 0 → 1 are prerequisites for everything."** The codebase
was still stock grayscale shadcn — `globals.css` held pure-chroma-zero tokens
(`oklch(… 0 0)`), `layout.tsx` hardcoded `bg-stone-50 text-stone-900`,
`--font-heading` pointed at the sans stack, there was no `ThemeProvider`, and
`next-themes` (a dependency) was unused. Phase 1's primitives consume tokens
that did not yet exist (`--gold`, the status set, `shadow-soft`/`shadow-lifted`,
Fraunces). So Phase 0 was implemented first; this doc records it.

## What changed, where, and why

### `app/globals.css` (0.1, 0.2, 0.7) — full rewrite

- **Light + dark token sets** replacing the grayscale `:root`/`.dark`. Every
  value is the burgundy/parchment system from the plan's spec table, authored in
  OKLCH:
  - Light: parchment `--background` (`0.985 0.006 70`), warm-ink `--foreground`,
    crisp-white `--card`, oxblood `--primary` (`0.38 0.13 18`), warm hairline
    `--border`, burgundy-tinted `--ring`.
  - Dark: warm near-black aubergine canvas (`0.18 0.012 30`), parchment text,
    **lifted** burgundy `--primary` (`0.62 0.16 18`) so it keeps AA contrast on
    dark (full AA audit deferred to Phase 10 per the plan).
- **`--gold` / `--gold-foreground`** added in both themes (wine-master/premium).
- **Semantic status system** added as raw tokens in both themes —
  `--success`, `--warning`, `--danger`, `--neutral`, `--info` (+ `-foreground`
  each) — chosen so the tone *is* legible as text on a soft tint of itself
  (light ≈ the old `-700` text colors; dark = lifted). This is the single source
  of truth the new `Badge tone=…`, status dots, and banners all read from.
- **`@theme inline` additions** so the above become real Tailwind utilities:
  `bg-success` / `text-warning` / `bg-gold` / `text-info-foreground` etc. all
  exist now. Also wired **`--font-sans` → `--font-geist-sans`** (it was a
  no-op self-reference before, so Geist wasn't reliably applied) and
  **`--font-heading` → `--font-fraunces`**.
- **Two-tier elevation**: `--shadow-soft` and `--shadow-lifted` defined as
  `box-shadow` theme values that reference a per-theme `--shadow-color` (warm ink
  in light, black in dark). Because the color is an inner `var()`, the same
  `shadow-soft` utility is automatically theme-aware. Generates `shadow-soft` /
  `shadow-lifted` utilities for Phase 1's Card.
- **Motion tokens** (`--ease-out-quint`, `--duration-{micro,default,overlay}`)
  registered for consistent use in later phases.
- **`--radius` 0.625rem → 0.75rem** (softer, per spec). The derived
  `--radius-sm…4xl` scale is preserved (primitives reference it).
- **Type scale** as `@layer components` classes: `.text-display` (clamped
  hero), `.text-h1`, `.text-h2`, plus a hardened `.font-heading` — all set
  Fraunces with `font-optical-sizing: auto` and a `ui-serif, Georgia` fallback.
- **Global reduced-motion guard**: `@media (prefers-reduced-motion: reduce)`
  collapses all animation/transition durations to ~0. This satisfies the plan's
  "all motion gated behind `prefers-reduced-motion`" up front, so every later
  phase inherits it for free.

### `app/layout.tsx` (0.3, 0.4, 0.5) — rewrite

- Loads **Fraunces** via `next/font/google` as `--font-fraunces` (variable,
  `display: "swap"` → no FOUT/CLS). Geist Sans/Mono kept, both given explicit
  `display: "swap"`.
- **Body de-hardcoded**: `bg-stone-50 text-stone-900` → `bg-background
  text-foreground` so the theme actually drives the canvas.
- **`suppressHydrationWarning`** on `<html>` (next-themes sets `class`/`style`
  pre-hydration).
- Wraps the tree in **`<ThemeProvider attribute="class" defaultTheme="system"
  enableSystem disableTransitionOnChange>`**.
- Mounts **`<Toaster />`** here (this is plan item 1.7, done early since it lives
  in the layout and must sit inside the ThemeProvider to pick up the theme).

### `components/theme-provider.tsx` (0.5) — new

Thin `"use client"` wrapper around `next-themes`' provider (the provider itself
must be a client component; the root layout stays a server component).

### `components/theme-toggle.tsx` (0.6) — new

Sun/moon icon button (lucide, built on the `Button` ghost/icon variant). Guards
against hydration mismatch with a `mounted` flag, toggles off `resolvedTheme`.
Built now; wired into the nav in Phase 2 (and the profile page in Phase 9).

## Design decisions / notes for later phases

- **Font variable naming**: Fraunces is exposed as `--font-fraunces` and mapped
  to `--font-heading` in `@theme`, rather than naming the font var
  `--font-heading` directly — avoids a self-referential clash between next/font's
  html-scoped var and Tailwind's theme var.
- **Status tokens are "text-first."** Badges use `bg-<tone>/12 text-<tone>`
  (soft tint), so the token is tuned to read as *text* on its own faint tint in
  light and on dark cards in dark. The `-foreground` companions exist for any
  future solid-fill usage.
- **Custom Fraunces axes** (SOFT/WONK) were *not* passed to `next/font` to keep
  the build robust; optical sizing is on via CSS. Can be revisited if we want
  the "wonky" editorial flavor.
- AA contrast is engineered into the token choices but the **formal audit is
  Phase 10** (10.2), as the plan schedules.

## Acceptance criteria — met

- ✅ Toggling theme flips the whole app between warm-light and warm-dark; no
  grayscale `stone-*` on the body/shell (body now token-driven).
- ✅ Fraunces is loaded and available on `.font-heading` / `.text-*` (visible on
  headings as screens adopt them in later phases); `display: swap` → no CLS.
- ✅ `prefers-color-scheme` respected on first load (`defaultTheme="system"`,
  `enableSystem`); choice persists (next-themes localStorage).
- ✅ `npm run build` green; static pages prerender.
