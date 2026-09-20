"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Building, Office } from "@/lib/types";
import { t } from "@/lib/i18n";
import { officeUrl, officeSlug, buildingSlug } from "@/lib/buildings-client";
import { officeMatchesQuery } from "@/lib/office-search";
import { downloadPlaquePng } from "@/components/QrPlaque";
import { QrPlaqueSsr } from "@/components/QrPlaqueSsr";
import { Spinner } from "@/components/Spinner";

type Props = {
  buildings: Building[];
  offices: Office[];
  origin: string;
  qrImages: Record<string, string>;
};

const copy = t("el");

export function HomeClient({ buildings, offices, origin, qrImages }: Props) {
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const published = useMemo(() => offices.filter((o) => o.published), [offices]);
  const filtered = useMemo(() => {
    const byBuilding =
      buildingFilter === "all"
        ? published
        : published.filter((o) => o.buildingCode === buildingFilter);
    return byBuilding.filter((o) => officeMatchesQuery(o, query));
  }, [published, buildingFilter, query]);

  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-gold bg-gradient-to-br from-[#061833] via-navy to-[#1a4d96] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="shrink-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <img
                src="/assets/logo-vertical.png"
                alt={copy.brand}
                className="h-16 w-auto rounded-xl bg-white px-2.5 py-1.5 shadow-sm"
              />
            </Link>
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold">
                {copy.brand}
              </p>
              <h1 className="font-display text-2xl font-bold tracking-wide md:text-3xl">
                {copy.product}
              </h1>
              <p className="mt-0.5 text-sm text-white/75 md:text-base">{copy.tagline}</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            {copy.admin}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <p className="mb-6 max-w-2xl text-muted">{copy.qrHint}</p>

        <div className="mb-6 flex flex-wrap gap-2">
          {buildings
            .filter((b) => b.published)
            .map((b) => (
              <Link
                key={b.id}
                href={`/b/${buildingSlug(b)}`}
                className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:border-navy/30 hover:shadow-md"
              >
                {b.el.name}
              </Link>
            ))}
        </div>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold">
              {copy.offices}
              <span className="ml-2 text-lg font-semibold text-muted">
                {filtered.length}
              </span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex overflow-hidden rounded-lg border border-line bg-white text-sm font-semibold shadow-sm">
                {(
                  [
                    ["all", copy.filterAll],
                    ["1", copy.building1],
                    ["2", copy.building2],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`px-3.5 py-1.5 transition ${
                      buildingFilter === id
                        ? "bg-navy text-white"
                        : "text-navy hover:bg-paper"
                    }`}
                    onClick={() => setBuildingFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="relative min-w-[200px] flex-1 max-w-md">
                <span className="sr-only">{copy.searchPlaceholder}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm outline-none ring-navy/20 placeholder:text-muted focus:ring-2"
                />
              </label>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-[#1a1404] shadow-sm transition hover:brightness-105 disabled:opacity-40"
            disabled={!origin || filtered.length === 0 || downloadingAll}
            onClick={async () => {
              setDownloadingAll(true);
              try {
                for (const o of filtered) {
                  const loc = o.el;
                  const title = loc.occupant || loc.label;
                  await downloadPlaquePng(
                    officeUrl(officeSlug(o), origin),
                    title,
                    [o.code, loc.building].filter(Boolean).join(" · "),
                    `QR_${safe(o.code || title)}.png`,
                  );
                  await new Promise((r) => setTimeout(r, 250));
                }
              } finally {
                setDownloadingAll(false);
              }
            }}
          >
            {downloadingAll ? (
              <Spinner size="sm" layout="inline" />
            ) : null}
            <span>{downloadingAll ? "Λήψη…" : copy.downloadAll}</span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-line bg-card px-4 py-8 text-center text-muted">
            {copy.searchEmpty}
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => {
            const loc = o.el;
            const url = officeUrl(officeSlug(o), origin);
            const title = loc.occupant || loc.label;
            const qrSrc = qrImages[o.id];
            const subtitle = [o.code, loc.building].filter(Boolean).join(" · ");
            return (
              <article
                key={o.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 shadow-[0_10px_28px_rgba(11,42,91,0.08)] transition hover:shadow-[0_14px_36px_rgba(11,42,91,0.12)]"
              >
                <div className="text-center">
                  <div className="inline-block rounded-md bg-[#ece6d4] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-navy">
                    {o.code || loc.building || o.kind}
                  </div>
                  <h3 className="font-display mt-2 text-xl font-bold leading-snug">
                    {title}
                  </h3>
                  {loc.title ? (
                    <p className="text-sm text-muted">{loc.title}</p>
                  ) : null}
                </div>
                <div className="mx-auto w-full max-w-[240px]">
                  {qrSrc ? (
                    <QrPlaqueSsr qrSrc={qrSrc} title={title} subtitle={subtitle} />
                  ) : (
                    <div className="grid h-52 place-items-center rounded-md bg-navy/5 text-navy">
                      <Spinner size="md" label="Φόρτωση QR…" className="text-navy" />
                    </div>
                  )}
                </div>
                <p className="break-all text-center text-[11px] text-muted">
                  <span className="font-semibold text-navy">
                    {copy.permanentUrl}:{" "}
                  </span>
                  {url}
                </p>
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/o/${officeSlug(o)}`}
                    className="flex-1 rounded-lg border border-navy bg-white px-3 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-paper"
                  >
                    {copy.openPage}
                  </Link>
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold px-3 py-2.5 text-sm font-bold text-[#1a1404] transition hover:brightness-105 disabled:opacity-40"
                    disabled={downloadingId === o.id || downloadingAll}
                    onClick={async () => {
                      setDownloadingId(o.id);
                      try {
                        await downloadPlaquePng(
                          url,
                          title,
                          subtitle,
                          `QR_${safe(o.code || title)}.png`,
                        );
                      } finally {
                        setDownloadingId(null);
                      }
                    }}
                  >
                    {downloadingId === o.id ? (
                      <Spinner size="sm" layout="inline" />
                    ) : null}
                    <span>
                      {downloadingId === o.id ? "…" : copy.downloadQr}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function safe(name: string) {
  return (
    name.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_").slice(0, 80) || "qr"
  );
}
