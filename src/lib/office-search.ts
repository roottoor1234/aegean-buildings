import type { Office } from "@/lib/types";

/** Case-insensitive match across codes, names, titles, contact fields. */
export function officeMatchesQuery(o: Office, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const parts = [
    o.code,
    o.buildingCode,
    o.kind,
    o.phone,
    o.email,
    o.el.label,
    o.el.occupant,
    o.el.title,
    o.el.building,
    o.el.department,
    o.el.notes,
    o.en.label,
    o.en.occupant,
    o.en.title,
    o.en.building,
    o.en.department,
    o.en.notes,
    o.id,
  ];

  return parts.some((p) => (p || "").toLowerCase().includes(q));
}
