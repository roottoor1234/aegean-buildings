import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, Languages, X } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { Spinner, cx } from "@/components/ui";

/**
 * Google Translate for the public pages only, driven by our own picker.
 * The widget loads on first open; the choice is never sticky across reloads.
 */

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (options: { pageLanguage: string; autoDisplay?: boolean }, elementId: string) => void;
      };
    };
  }
}

type LangOption = { code: string; label: string };
const SCRIPT_ID = "google-translate-script";
const MOUNT_ID = "google_translate_element";

const combo = () => document.querySelector<HTMLSelectElement>(".goog-te-combo");

function readLanguages(): LangOption[] {
  const c = combo();
  if (!c) return [];
  return Array.from(c.options)
    .filter((o) => o.value)
    .map((o) => ({ code: o.value, label: o.textContent?.trim() || o.value }));
}

function clearPersistence() {
  const expire = "Thu, 01 Jan 1970 00:00:00 GMT";
  const host = window.location.hostname;
  for (const c of [
    `googtrans=;expires=${expire};path=/`,
    `googtrans=;expires=${expire};path=/;domain=${host}`,
    `googtrans=;expires=${expire};path=/;domain=.${host}`,
  ])
    document.cookie = c;
  if (window.location.hash.includes("googtrans")) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function applyLang(code: string): boolean {
  const c = combo();
  if (!c) return false;
  if (!code) {
    clearPersistence();
    window.location.reload();
    return true;
  }
  if (c.value === code) {
    c.value = "";
    c.dispatchEvent(new Event("change"));
  }
  c.value = code;
  c.dispatchEvent(new Event("change"));
  return true;
}

let initStarted = false;

function ensureWidget(pageLanguage: string) {
  if (!document.getElementById(MOUNT_ID)) {
    const host = document.createElement("div");
    host.id = MOUNT_ID;
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);
  }
  const mount = () => {
    const el = document.getElementById(MOUNT_ID);
    if (!el || !window.google?.translate?.TranslateElement || el.dataset.ready === "1") return;
    el.innerHTML = "";
    new window.google.translate.TranslateElement({ pageLanguage, autoDisplay: false }, MOUNT_ID);
    el.dataset.ready = "1";
  };
  if (window.google?.translate?.TranslateElement) return mount();
  window.googleTranslateElementInit = mount;
  if (initStarted) return;
  initStarted = true;
  if (!document.getElementById(SCRIPT_ID)) {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }
}

export function TranslateButton({ lang }: { lang: Lang }) {
  const copy = t(lang);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [langs, setLangs] = useState<LangOption[]>([]);
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const ready = langs.length > 0;

  useLayoutEffect(() => {
    clearPersistence();
  }, []);

  useEffect(() => {
    if (!open) return;
    ensureWidget(lang);
    setQuery("");
    const tick = window.setInterval(() => {
      const list = readLanguages();
      if (list.length) {
        setLangs(list);
        setTarget(combo()?.value || "");
        window.clearInterval(tick);
      }
    }, 200);
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? langs.filter((l) => l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)) : langs;
  }, [langs, query]);

  const pick = useCallback((code: string) => {
    setTarget(code);
    if (!applyLang(code)) window.setTimeout(() => applyLang(code), 400);
    if (code) setOpen(false);
  }, []);

  const option = (code: string, label: string) => {
    const active = target === code;
    return (
      <button
        key={code || "original"}
        type="button"
        onClick={() => pick(code)}
        className={cx(
          "flex min-h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-[0.9375rem] transition-colors hover:bg-paper sm:min-h-9 sm:text-sm",
          active && "font-semibold text-sea",
        )}
      >
        {label}
        {active ? <Check className="size-4 text-stone-ink" aria-hidden /> : null}
      </button>
    );
  };

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={copy.translateHint}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/25 bg-white/[0.08] px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
      >
        <Languages className="size-4" aria-hidden />
        <span>{copy.translate}</span>
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-sea-deep/40 sm:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label={copy.translate}
            className="animate-rise fixed inset-x-0 bottom-0 z-50 max-h-[78dvh] rounded-t-2xl bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-ink shadow-[var(--shadow-lift)] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 sm:rounded-xl sm:p-3"
          >
            <div className="mb-3 flex items-start justify-between gap-3 sm:mb-2">
              <p className="text-sm text-muted">{copy.translateHint}</p>
              <button
                type="button"
                className="-mr-1 -mt-1 grid size-9 place-items-center rounded-lg text-muted hover:bg-paper sm:hidden"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
              >
                <X className="size-4" />
              </button>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.translateSearch}
              disabled={!ready}
              autoFocus
              className="mb-2 h-11 w-full rounded-lg border border-line-strong bg-white px-3 text-base outline-none focus:border-sea-2 sm:h-9 sm:text-sm"
            />
            {!ready ? (
              <div className="grid place-items-center py-10">
                <Spinner label={copy.translateLoading} />
              </div>
            ) : (
              <div className="max-h-[48dvh] divide-y divide-line/70 overflow-y-auto rounded-lg border border-line sm:max-h-64">
                {option("", copy.translateOriginal)}
                {filtered.map((l) => option(l.code, l.label))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
