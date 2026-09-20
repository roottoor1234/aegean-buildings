/** Public URL slug — prefer room/building code over opaque id. */
export function officeSlug(o: { code?: string; id: string }): string {
  const code = (o.code || "").trim();
  return code || o.id;
}

export function buildingSlug(b: { buildingCode?: string; id: string }): string {
  const code = (b.buildingCode || "").trim();
  return code || b.id;
}

export function buildingPath(slug: string): string {
  return `/b/${encodeURIComponent(slug)}`;
}

export function officePath(slug: string): string {
  return `/o/${encodeURIComponent(slug)}`;
}

export function buildingUrl(slug: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}${buildingPath(slug)}`;
}

export function officeUrl(slug: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}${officePath(slug)}`;
}
