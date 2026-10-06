import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { ExternalLink, Globe, Mail, MapPin, Phone, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useContentLang } from "@/lib/lang";
import { buildingPath, buildingSlug, formatDate, officeMatches, telHref } from "@/lib/office";
import type { OfficeKind } from "@/lib/types";
import { useAsync } from "@/lib/useAsync";
import { Masthead, PublicFooter } from "@/components/public/Masthead";
import { Plate } from "@/components/public/Plate";
import { SpaceList } from "@/components/public/SpaceList";
import { TranslateButton } from "@/components/public/TranslateButton";
import { PublicError, PublicSkeleton } from "./PublicStates";

const KIND_ORDER: OfficeKind[] = ["office", "lab", "room"];

export default function BuildingPage() {
  const { slug = "" } = useParams();
  const lang = useContentLang();
  const copy = t(lang);
  const navigate = useNavigate();
  const res = useAsync(() => api.publicBuilding(slug), [slug]);
  const [query, setQuery] = useState("");

  const building = res.data?.building;
  const offices = useMemo(() => res.data?.offices ?? [], [res.data]);

  useEffect(() => {
    if (building && buildingSlug(building) !== slug) navigate(buildingPath(building) + window.location.search, { replace: true });
  }, [building, slug, navigate]);
  useEffect(() => {
    if (building) document.title = `${building[lang].name || building.el.name} · ${copy.brand}`;
  }, [building, lang, copy]);

  const groups = useMemo(() => {
    const matched = offices.filter((o) => officeMatches(o, query));
    return KIND_ORDER.map((kind) => ({ kind, items: matched.filter((o) => o.kind === kind) })).filter((g) => g.items.length);
  }, [offices, query]);

  if (res.status === "loading") return <PublicSkeleton lang={lang} />;
  if (res.status === "error" || !building) return <PublicError lang={lang} error={res.error} onRetry={res.reload} />;

  const loc = building[lang];
  const name = loc.name || building.el.name;
  const maps = building.lat != null && building.lng != null ? `https://www.google.com/maps/search/?api=1&query=${building.lat},${building.lng}` : null;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="min-h-dvh">
      <Masthead lang={lang} right={<TranslateButton lang={lang} />} />
      <Plate
        numeral={building.code || undefined}
        numeralLabel={copy.building}
        meta={
          <>
            {copy.building}
            <span className="block text-white/90">{loc.island}</span>
          </>
        }
        title={name}
        subtitle={loc.school}
      >
        {loc.notes ? <p className="mt-4 max-w-prose text-[0.9375rem] leading-relaxed text-white/70">{loc.notes}</p> : null}
      </Plate>

      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <section className="pt-7" aria-labelledby="spaces-h">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="spaces-h" className="font-display text-[1.75rem] font-semibold text-ink">
              {copy.spaces}
            </h2>
            <span className="nums text-sm font-semibold text-muted">{copy.results(total)}</span>
          </div>

          {offices.length > 6 ? (
            <label className="relative mb-4 block">
              <span className="sr-only">{copy.searchSpaces}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.searchSpaces}
                className="h-12 w-full rounded-xl border border-line-strong bg-white pl-11 pr-11 text-base outline-none transition-shadow placeholder:text-muted/75 focus:border-sea-2 focus:shadow-[0_0_0_3px_rgb(21_107_168/0.14)]"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label={copy.clear} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-paper">
                  <X className="size-4" />
                </button>
              ) : null}
            </label>
          ) : null}

          {groups.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong px-5 py-8 text-center text-muted">
              {copy.noResults}
              <span className="mt-1 block text-sm">{copy.noResultsHint}</span>
            </p>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <div key={g.kind}>
                  {groups.length > 1 ? (
                    <h3 className="mb-2 flex items-baseline gap-2 text-[0.9375rem] font-semibold text-ink/80">
                      {copy.kindPlural[g.kind]}
                      <span className="nums text-[0.8125rem] font-medium text-muted">{g.items.length}</span>
                    </h3>
                  ) : null}
                  <SpaceList offices={g.items} lang={lang} />
                </div>
              ))}
            </div>
          )}
        </section>

        {loc.departments.length ? (
          <section className="mt-10" aria-labelledby="deps-h">
            <h2 id="deps-h" className="font-display mb-3 text-[1.75rem] font-semibold">{copy.departments}</h2>
            <ul className="space-y-1.5 text-[1rem]">
              {loc.departments.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-[0.6em] h-px w-3 shrink-0 bg-stone" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10" aria-labelledby="visit-h">
          <h2 id="visit-h" className="font-display mb-3 text-[1.75rem] font-semibold">{copy.contact}</h2>
          <div className="divide-y divide-line/80 overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-card)]">
            {loc.address ? (
              <InfoRow icon={<MapPin className="size-[18px]" />} label={copy.address} href={maps ?? undefined} external action={maps ? copy.directions : undefined}>
                {loc.address}
              </InfoRow>
            ) : null}
            {building.phone ? (
              <InfoRow icon={<Phone className="size-[18px]" />} label={copy.secretariat} href={telHref(building.phone)}>
                <span className="nums">{building.phone}</span>
              </InfoRow>
            ) : null}
            {building.email ? (
              <InfoRow icon={<Mail className="size-[18px]" />} label={copy.email} href={`mailto:${building.email}`}>
                {building.email}
              </InfoRow>
            ) : null}
            {building.website ? (
              <InfoRow icon={<Globe className="size-[18px]" />} label={copy.website} href={building.website} external>
                {(() => {
                  try {
                    return new URL(building.website).hostname.replace(/^www\./, "");
                  } catch {
                    return building.website;
                  }
                })()}
              </InfoRow>
            ) : null}
          </div>
        </section>
      </main>

      <PublicFooter lang={lang} updatedAt={formatDate(building.updatedAt, lang)} />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  href,
  external,
  action,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  action?: string;
  children: ReactNode;
}) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-2 text-sea">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.8125rem] font-semibold text-muted">{label}</span>
        <span className="block break-words text-[1rem] font-semibold text-ink">{children}</span>
        {action ? <span className="mt-0.5 block text-[0.875rem] font-semibold text-sea">{action}</span> : null}
      </span>
      {external ? <ExternalLink className="size-4 shrink-0 text-muted" aria-hidden /> : null}
    </>
  );
  const cls = "flex min-h-16 items-center gap-3.5 px-4 py-3 sm:px-5";
  return href ? (
    <a href={href} className={`${cls} transition-colors hover:bg-paper/70 active:bg-paper-2`} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}
