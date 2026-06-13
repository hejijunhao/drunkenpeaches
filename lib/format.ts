import { format, parseISO } from "date-fns";

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
