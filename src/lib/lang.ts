import { useEffect, useState } from "react";
import type { Lang } from "./types";

/** Greek browsers → el, everything else → en. `?lang=el|en` overrides. */
export function detectLang(): Lang {
  if (typeof window === "undefined") return "el";
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "el" || fromUrl === "en") return fromUrl;
  const candidates = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const raw of candidates) {
    const tag = raw.toLowerCase();
    if (tag === "el" || tag.startsWith("el-")) return "el";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return "en";
}

export function useContentLang(): Lang {
  const [lang] = useState<Lang>(detectLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return lang;
}
