"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/types";
import { detectLangFromNavigator, parseLangParam } from "@/lib/lang";

/** Browser language for content (el/en). No sticky override. */
export function useContentLang(initialLang: Lang = "el") {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    const fromUrl = parseLangParam(
      new URLSearchParams(window.location.search).get("lang"),
    );
    const next = fromUrl || detectLangFromNavigator();
    setLang(next);
    document.documentElement.lang = next;
  }, []);

  return { lang };
}
