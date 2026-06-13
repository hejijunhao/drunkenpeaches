# Phase 9 — Settings & profile — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓, `build` ✓.
> Grep-clean: no `text-stone-*` / `text-emerald-700` / `Saved ✓` / `bg-white`
> in settings & profile.

Goal: account/club configuration feels considered and consistent.

## Club settings — `settings/page.tsx` + `settings-form.tsx` (9.1)
- `PageHeader`.
- Settings grouped into **three titled cards**: **Identity** (club name + a
  read-only `/c/{slug}` URL as a styled static field), **Sign-ups** (cutoff
  days), **Guests** (a polished `Switch` row + an **animated** max-guests reveal,
  with a hidden input preserving the value when guests are off).
- **Toast on save** ("Settings saved") via `useSuccessToast` (the action returns
  `{}` and revalidates — fires correctly); inline `Button` `loading`.

## Profile — `profile/page.tsx` + `profile-form.tsx` (9.2, 9.3)
- Header with a large **avatar**, name, and member-since / role / **wine-master**
  chips.
- Edit form on the new primitives; **read-only email as a styled static field**
  (not a disabled input).
- The inline **"Saved ✓"** is gone — replaced by a **toast** ("Profile saved").
  (`updateMyProfileAction` returns `{ success: true }` and stays in place.)
- **Attendance history** now uses the shared `AttendanceHistory` component, so it
  matches the member-detail treatment (6.3) exactly.
- **Theme toggle (9.3)**: an **Appearance** card with a labelled "Theme" row +
  `ThemeToggle` (in addition to the nav toggle).

## Decision — theme row placement
The plan put 9.3 in `profile-form.tsx`. A theme toggle isn't part of the profile
*form submission*, so it lives in its own **Appearance card** on the profile page
(outside the `<form>`) — cleaner separation, same outcome (toggle on the profile
screen).

## Acceptance criteria — met
- ✅ Settings & profile saves **toast**; the guests toggle animates its reveal;
  both themes clean.
