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

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
