# Phase 2 — App shell & navigation — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓, `build` ✓.

Goal: the frame around every screen feels like a product, not a header bar.

## `components/app-nav.tsx` — full redesign (2.1, 2.2, 2.3, 2.5)

- **Token-driven (2.1).** Removed every `bg-white` / `hover:bg-stone-100` /
  `text-stone-600`. Header is now `border-border` + a translucent
  `bg-background/80 backdrop-blur` sticky bar (`supports-[backdrop-filter]`
  fallback). Height bumped `h-14 → h-16` for comfort.
- **Burgundy active state (2.1).** Active route = `bg-accent text-primary
  font-medium`; inactive = `text-muted-foreground hover:bg-accent
  hover:text-foreground`. Unmistakable in both themes.
- **Refined club lockup (2.1).** Peach mark + the club name set in **Fraunces**
  (`font-heading`), always visible (truncates rather than hiding on mobile).
- **ThemeToggle + user menu (2.2).** The Phase 0 `ThemeToggle` sits in the
  desktop right cluster. The loose profile link + sign-out form became a proper
  **dropdown user menu** (base-ui `DropdownMenu`): avatar (initials fallback,
  burgundy tint) + name + chevron → a menu with a name/role header, **My
  profile**, and a destructive **Sign out**.
- **Sign out** posts to `/auth/signout` via a hidden `<form>` submitted with
  `requestSubmit()` from the menu item's `onClick` (avoids portal/form nesting
  issues with the menu popup).
- **Mobile nav reworked (2.3).** Slide-down panel (`animate-in fade-in
  slide-in-from-top-2`, reduced-motion-safe via the Phase 0 guard), larger
  `py-3` tap targets, the same active treatment, plus an account row (avatar +
  name + role), a labelled **Theme** toggle row, and a full-width **Sign out** —
  all usable at 375px. Menu icon swaps Menu↔X on the token-driven ghost button.
- **Role indicators (2.5).** User menu + mobile account row show a role label
  ("Committee", "Committee · Wine master", or "Member") and a small **gold wine
  glass** icon for wine masters.

## `app/c/[club]/layout.tsx` (2.4)

- `<main>` inherits the parchment `bg-background` (from the Phase 0 body fix);
  padding given a touch more breathing room (`py-8 sm:py-10`), max-width kept at
  `max-w-6xl`. Pages own their internal `space-y-8` rhythm (applied per screen in
  later phases).

## Notes

- `initials(name)` helper added to `lib/format.ts` (first+last initial, ≤2
  chars) — reused by Members/Profile avatars in Phases 6/9.
- The user menu uses the existing base-ui `DropdownMenu`; items render Links via
  the `render` prop. No new primitive needed.

## Acceptance criteria — met

- ✅ Active route is unmistakable (burgundy) in both themes.
- ✅ Mobile menu is smooth, fully usable at 375px, includes theme + sign out.
- ✅ No hardcoded stone/white colors remain in the shell (grep-clean for the
  nav + club layout).
