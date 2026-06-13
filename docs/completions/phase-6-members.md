# Phase 6 — Members — ✅ Complete

> Companion to [../plans/frontend-redesign-2026.md](../plans/frontend-redesign-2026.md).
> Completed 2026-06-13. Verified: `tsc` ✓, `lint` ✓, `build` ✓.
> Grep-clean: no native `<select>` / `text-stone-*` / `text-red-600` /
> `text-emerald-700` / `bg-white` in `app/c/[club]/members`.

Goal: roster, invite, and member profiles feel like a CRM, not a spreadsheet.

## Roster — `members/page.tsx` (6.1)
- `PageHeader` with the active-member count.
- The responsive-hide table is now a **`DataList`** that reflows to stacked,
  fully-labelled cards below `sm` (no hidden-data dead-ends on mobile).
- Name column shows an **avatar (initials)** + a gold wine-glass for wine
  masters; status via `StatusBadge`.
- Row actions (Re-send invite / Edit) are a tidy right-aligned button cluster.

## InviteForm — `members/invite-form.tsx` (6.2)
- The awkward `flex flex-wrap` + min-widths replaced by a clean responsive grid
  (`1fr 1fr auto auto`).
- Role is a real `Select`; submit uses `loading`.
- **Success toast** ("Invite sent") via `useSuccessToast` (the action returns
  `{}` and revalidates in place, so this fires correctly). The form reset is now
  gated on a genuine submit (a `submitted` ref) instead of firing on mount.

## Member detail — `members/[id]/page.tsx` (6.3)
- Header with a large **avatar**, name, status badge, "member since", a role
  chip, and a wine-master `info` badge.
- **Attendance history** extracted to a shared `AttendanceHistory` component
  (reused by Profile in Phase 9): a timeline with `success`/`danger` tone badges
  for attended/no-show — replacing the ad-hoc `text-emerald-700`/`text-red-600`.

## MemberEditForm — `members/[id]/member-edit-form.tsx` (6.4)
- `Select` for role and status; **`Switch`** for wine-master (committee only).
- Read-only email rendered as a **styled static field** (muted panel), not a
  disabled input.
- **Destructive-change confirm**: switching status to *removed* turns the save
  button into a red "Remove member" and gates submission behind a `ConfirmDialog`
  (the form is submitted via ref on confirm). Self-role still locked with a
  hidden-input fallback.

## `members/loading.tsx` (6.5)
Skeleton: header + invite card + a table-shaped roster placeholder.

## Shared additions
- `components/attendance-history.tsx` — timeline list, reused by Profile (9.2).

## Toast scope note
`updateMemberAction` **redirects** to the roster on success (unchanged server
action), so member-edit success feedback is that navigation rather than a toast
— consistent with the Phase 5 decision to not alter server actions. Invite (no
redirect) does toast.

## Acceptance criteria — met
- ✅ Roster is fully usable on mobile (DataList card reflow — no hidden data).
- ✅ Invite flow gives clear success feedback (toast); role/status are real
  `Select`s; wine-master is a `Switch`.
