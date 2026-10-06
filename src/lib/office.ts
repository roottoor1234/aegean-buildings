import type { Building, Lang, Office } from "./types";

/** Δημόσιο slug: η αρίθμηση της πόρτας, αλλιώς το id. */
export function officeSlug(o: Pick<Office, "code" | "id">): string {
  return o.code.trim() || o.id;
}

export function buildingSlug(b: Pick<Building, "code" | "id">): string {
  return b.code.trim() || b.id;
}

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const officePath = (o: Pick<Office, "code" | "id">) => `/o/${encodeURIComponent(officeSlug(o))}`;
export const buildingPath = (b: Pick<Building, "code" | "id">) => `/b/${encodeURIComponent(buildingSlug(b))}`;

export function absoluteUrl(path: string): string {
  return `${window.location.origin}${base}${path}`;
}

/**
 * What the door says, in order of usefulness:
 * a person's name, else what the room is (title), else its label.
 */
export function officeHeadline(o: Office, lang: Lang): { headline: string; sub: string } {
  const loc = o[lang];
  const fallback = o.el;
  const occupant = loc.occupant || fallback.occupant;
  const title = loc.title || fallback.title;
  const label = loc.label || fallback.label;
  if (occupant) return { headline: occupant, sub: title };
  if (title) return { headline: title, sub: "" };
  return { headline: label || o.code, sub: "" };
}

/** Accent-insensitive, case-insensitive match across both languages. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/ς/g, "σ");
}

export function officeMatches(o: Office, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const hay = normalize(
    [
      o.code,
      o.phone,
      o.email,
      o.el.label,
      o.el.occupant,
      o.el.title,
      o.el.notes,
      o.en.label,
      o.en.occupant,
      o.en.title,
    ].join(" "),
  );
  return q.split(/\s+/).every((part) => hay.includes(part));
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatDate(value: string | null | undefined, lang: Lang = "el"): string {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function relativeTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T"));
  const diff = (Date.now() - d.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("el", { numeric: "auto" });
  if (diff < 60) return "μόλις τώρα";
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  if (diff < 86400 * 30) return rtf.format(-Math.round(diff / 86400), "day");
  return formatDate(value);
}

export function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_").slice(0, 80) || "qr";
}
