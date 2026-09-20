import type { Lang } from "./types";

/** Map browser / Accept-Language to our two content locales. Greek → el, everything else → en. */
export function detectLangFromAcceptLanguage(header: string | null | undefined): Lang {
  if (!header) return "en";
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.split("=")[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    if (tag === "el" || tag.startsWith("el-")) return "el";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  // Non-Greek browsers get English content by default.
  return "en";
}

export function detectLangFromNavigator(): Lang {
  if (typeof navigator === "undefined") return "en";
  const candidates = [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean) as string[];
  for (const raw of candidates) {
    const tag = raw.toLowerCase();
    if (tag === "el" || tag.startsWith("el-")) return "el";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return "en";
}

export function parseLangParam(value: string | null | undefined): Lang | null {
  if (value === "el" || value === "en") return value;
  return null;
}
