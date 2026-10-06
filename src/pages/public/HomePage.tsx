import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useContentLang } from "@/lib/lang";
import { buildingPath, officeMatches } from "@/lib/office";
import { useAsync } from "@/lib/useAsync";
import { Masthead, PublicFooter } from "@/components/public/Masthead";
import { SpaceList } from "@/components/public/SpaceList";
import { TranslateButton } from "@/components/public/TranslateButton";
import { ErrorNotice, Segmented, Skeleton } from "@/components/ui";

export default function HomePage() {
  const lang = useContentLang();
  const copy = t(lang);
  const res = useAsync(() => api.directory(), []);
  const [query, setQuery] = useState("");
  const [building, setBuilding] = useState("all");

  useEffect(() => {
    document.title = `${copy.product} ${copy.departmentShort} · ${copy.brand}`;
  }, [copy]);

  const buildings = useMemo(() => res.data?.buildings ?? [], [res.data]);
  const offices = useMemo(() => res.data?.offices ?? [], [res.data]);
  const byId = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings]);
  const results = useMemo(
    () => offices.filter((o) => (building === "all" || o.buildingId === building) && officeMatches(o, query)),
    [offices, building, query],
  );
  const buildingLabel = (id: string | null) => {
    const b = id ? byId.get(id) : undefined;
    return b ? `${copy.building} ${b.code}` : undefined;
  };

  return (
    <div className="min-h-dvh">
      <Masthead lang={lang} right={<TranslateButton lang={lang} />} />

      <header className="on-sea relative bg-sea text-white">
        <div className="mx-auto max-w-2xl px-4 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-12">
          <h1 className="font-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.01em] sm:text-[3.25rem]">{copy.homeTitle}</h1>
          <p className="mt-3 max-w-[34rem] text-[1.0625rem] leading-relaxed text-white/90">{copy.homeLead}</p>
          <div className="animate-rule my-6 h-px bg-stone/80" aria-hidden />
          <label className="relative block">
            <span className="sr-only">{copy.searchPlaceholder}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-sea/55" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              autoComplete="off"
              className="h-14 w-full rounded-xl border-0 bg-white pl-12 pr-12 text-[1.0625rem] text-ink shadow-[0_10px_30px_-12px_rgb(16_52_82/0.5)] outline-none placeholder:text-muted/70 focus:shadow-[0_0_0_3px_var(--stone-soft)]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={copy.clear}
                className="absolute right-2.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-paper"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
          {buildings.length > 1 ? (
            <div className="mt-4">
              <Segmented
                tone="sea"
                label={copy.buildings}
                value={building}
                onChange={setBuilding}
                options={[
                  { value: "all", label: copy.all },
                  ...buildings.map((b) => ({ value: b.id, label: `${copy.building} ${b.code}` })),
                ]}
              />
            </div>
          ) : null}
        </div>
        <div className="h-1.5 bg-stone" aria-hidden />
      </header>

      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        {res.status === "error" ? (
          <div className="pt-6">
            <ErrorNotice message={res.error.message} onRetry={res.reload} />
          </div>
        ) : null}

        <section className="pt-6" aria-live="polite">
          <p className="nums mb-3 text-sm font-semibold text-muted">
            {res.status === "ok" ? copy.results(results.length) : " "}
          </p>
          {res.status === "loading" ? (
            <div className="space-y-px overflow-hidden rounded-2xl border border-line">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-16 rounded-none" />
              ))}
            </div>
          ) : results.length ? (
            <SpaceList offices={results} lang={lang} buildingLabel={(o) => (building === "all" ? buildingLabel(o.buildingId) : undefined)} />
          ) : res.status === "ok" ? (
            <p className="rounded-2xl border border-dashed border-line-strong px-5 py-10 text-center text-muted">
              <span className="font-display block text-xl font-semibold text-ink">{copy.noResults}</span>
              <span className="mt-1 block text-sm">{copy.noResultsHint}</span>
            </p>
          ) : null}
        </section>

        {buildings.length ? (
          <section className="mt-12" aria-labelledby="b-h">
            <h2 id="b-h" className="font-display mb-3 text-[1.75rem] font-semibold">
              {copy.buildings}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {buildings.map((b) => {
                const count = offices.filter((o) => o.buildingId === b.id).length;
                return (
                  <Link
                    key={b.id}
                    to={buildingPath(b)}
                    className="group relative overflow-hidden rounded-2xl bg-sea p-5 text-white shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-display nums text-6xl font-medium leading-[0.8] text-stone-soft">{b.code}</span>
                      <ArrowRight className="size-5 text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-stone-soft" aria-hidden />
                    </div>
                    <div className="my-4 h-px bg-stone/60" aria-hidden />
                    <p className="font-display text-xl font-semibold leading-tight">{b[lang].name || b.el.name}</p>
                    <p className="nums mt-1 text-sm text-white/90">
                      {copy.results(count)} · {b[lang].island}
                    </p>
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-stone" aria-hidden />
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
