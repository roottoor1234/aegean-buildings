"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { Spinner } from "@/components/Spinner";

type Props = {
  pageLang: Lang;
  variant?: "onDark" | "onLight";
};

type LangOption = { code: string; label: string };

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            autoDisplay?: boolean;
          },
          elementId: string,
        ) => void;
      };
    };
  }
}

const SCRIPT_ID = "google-translate-script";
const MOUNT_ID = "google_translate_element";

function getCombo(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>(".goog-te-combo");
}

/** Full language list from Google's widget (100+). */
function readGoogleLanguages(): LangOption[] {
  const combo = getCombo();
  if (!combo) return [];
  return Array.from(combo.options)
    .filter((o) => o.value)
    .map((o) => ({ code: o.value, label: o.textContent?.trim() || o.value }));
}

function readActiveCode(): string {
  const combo = getCombo();
  if (combo?.value) return combo.value;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
  return match?.[1] || "";
}

function applyGoogleLang(code: string) {
  const combo = getCombo();
  if (!combo) return false;

  if (!code) {
    document.cookie = "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie =
      "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
      window.location.hostname;
    window.location.reload();
    return true;
  }

  if (combo.value === code) {
    combo.value = "";
    combo.dispatchEvent(new Event("change"));
  }
  combo.value = code;
  combo.dispatchEvent(new Event("change"));
  return true;
}

let initStarted = false;

function ensureGoogleTranslate(pageLanguage: string) {
  if (typeof document === "undefined") return;

  if (!document.getElementById(MOUNT_ID)) {
    const host = document.createElement("div");
    host.id = MOUNT_ID;
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;clip:rect(0,0,0,0);";
    document.body.appendChild(host);
  }

  const mount = () => {
    const el = document.getElementById(MOUNT_ID);
    if (!el || !window.google?.translate?.TranslateElement) return;
    if (el.dataset.ready === "1") return;
    el.innerHTML = "";
    new window.google.translate.TranslateElement(
      { pageLanguage, autoDisplay: false },
      MOUNT_ID,
    );
    el.dataset.ready = "1";
  };

  if (window.google?.translate?.TranslateElement) {
    mount();
    return;
  }

  if (initStarted) {
    window.googleTranslateElementInit = mount;
    return;
  }
  initStarted = true;
  window.googleTranslateElementInit = mount;

  if (!document.getElementById(SCRIPT_ID)) {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }
}

/** Google Translate — full language list from Google's own widget. */
export function GoogleTranslateButton({
  pageLang,
  variant = "onDark",
}: Props) {
  const copy = t(pageLang);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [ready, setReady] = useState(false);
  const [langs, setLangs] = useState<LangOption[]>([]);
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const dark = variant === "onDark";

  useEffect(() => {
    ensureGoogleTranslate(pageLang);
    const tick = window.setInterval(() => {
      const list = readGoogleLanguages();
      if (list.length > 0) {
        setLangs(list);
        setReady(true);
        setTarget(readActiveCode());
        window.clearInterval(tick);
      }
    }, 200);
    return () => window.clearInterval(tick);
  }, [pageLang]);

  useEffect(() => {
    if (!open) return;
    setTarget(readActiveCode());
    setQuery("");
    // Refresh list in case widget populated late
    const list = readGoogleLanguages();
    if (list.length) setLangs(list);

    function onDoc(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return langs;
    return langs.filter(
      (l) =>
        l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q),
    );
  }, [langs, query]);

  const onPick = useCallback((code: string) => {
    setTarget(code);
    if (!applyGoogleLang(code)) {
      window.setTimeout(() => applyGoogleLang(code), 400);
    }
    if (code) setOpen(false);
  }, []);

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={copy.translateHint}
        className={
          dark
            ? "inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3.5 py-2.5 text-sm font-semibold text-white transition active:bg-white/25"
            : "inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-navy transition active:bg-paper"
        }
      >
        <TranslateIcon />
        <span className="max-sm:sr-only">{copy.translate}</span>
        <span className="sm:hidden" aria-hidden="true">
          {pageLang === "el" ? "Γλώσσα" : "Lang"}
        </span>
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/35 sm:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            className="
              fixed inset-x-0 bottom-0 z-50 max-h-[75dvh] rounded-t-2xl border border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-ink shadow-2xl
              sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-[min(280px,calc(100vw-2rem))] sm:rounded-xl sm:p-3 sm:pb-3 sm:shadow-xl
            "
          >
            <div className="mb-3 flex items-center justify-between gap-2 sm:mb-2 sm:block">
              <p className="text-sm font-semibold text-ink sm:text-xs sm:font-normal sm:text-muted">
                {copy.translateHint}
              </p>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm font-semibold text-muted sm:hidden"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                pageLang === "el" ? "Αναζήτηση γλώσσας…" : "Search language…"
              }
              disabled={!ready}
              className="mb-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-base sm:rounded-lg sm:px-2.5 sm:py-2 sm:text-sm"
              autoFocus
            />
            {!ready ? (
              <div className="grid place-items-center py-10 text-navy">
                <Spinner
                  size="md"
                  label={pageLang === "el" ? "Φόρτωση γλωσσών…" : "Loading languages…"}
                  className="text-navy"
                />
              </div>
            ) : (
              <div className="max-h-[45dvh] overflow-y-auto rounded-xl border border-line sm:max-h-64 sm:rounded-lg">
                <button
                  type="button"
                  className={`block min-h-11 w-full px-3 py-3 text-left text-base hover:bg-paper sm:min-h-0 sm:py-2 sm:text-sm ${
                    !target ? "bg-navy/10 font-semibold text-navy" : ""
                  }`}
                  onClick={() => onPick("")}
                >
                  {copy.translateOriginal}
                </button>
                {filtered.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`block min-h-11 w-full px-3 py-3 text-left text-base hover:bg-paper sm:min-h-0 sm:py-2 sm:text-sm ${
                      target === l.code ? "bg-navy/10 font-semibold text-navy" : ""
                    }`}
                    onClick={() => onPick(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
                {filtered.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted">—</p>
                ) : null}
              </div>
            )}
            {ready ? (
              <p className="mt-2 text-[11px] text-muted">
                {filtered.length}/{langs.length}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function TranslateIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="opacity-90"
    >
      <path
        d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
        fill="currentColor"
      />
    </svg>
  );
}
