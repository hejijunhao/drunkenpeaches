import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function fmtDate(date: string) {
  return format(parseISO(date), "EEEE d MMMM yyyy");
}

export function fmtDateShort(date: string) {
  return format(parseISO(date), "EEE d MMM yyyy");
}

export function fmtTime(time: string) {
  return time.slice(0, 5);
}

export function fmtDateTime(iso: string) {
  return format(new Date(iso), "EEE d MMM yyyy, HH:mm");
}

/** Pieces of a date for the calendar-tile treatment on lunch cards. */
export function dateParts(date: string) {
  const d = parseISO(date);
  return {
    weekday: format(d, "EEE"),
    day: format(d, "d"),
    month: format(d, "MMM"),
    year: format(d, "yyyy"),
  };
}

/** Whole calendar days from today to `date` (negative when past). */
export function daysUntil(date: string) {
  return differenceInCalendarDays(parseISO(date), new Date());
}

/** "in 12 days", "tomorrow", "today", "3 days ago". */
export function relativeDays(date: string) {
  const n = daysUntil(date);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  if (n > 1) return `in ${n} days`;
  return `${-n} days ago`;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** Up to two uppercase initials from a name, for avatar fallbacks. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
