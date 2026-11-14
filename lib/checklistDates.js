// Date helpers for checklists. Client-safe (no story text).
import { occurrence } from "@/lib/occurrence";

// First day of a festival in a given year.
export function festivalStart(festivalId, year) {
  const o = year ? occurrence(festivalId, year) : null;
  return o ? new Date(o.start.y, o.start.m, o.start.d) : null;
}

// "do by" date for an item, counted back from that year's first day.
export function doBy(festivalId, before, year) {
  const s = festivalStart(festivalId, year);
  return s ? new Date(s.getFullYear(), s.getMonth(), s.getDate() - before) : null;
}

