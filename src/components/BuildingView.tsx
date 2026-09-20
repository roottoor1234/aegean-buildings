"use client";

import Link from "next/link";
import type { Building, Lang, Office } from "@/lib/types";
import { t } from "@/lib/i18n";
import { officeSlug } from "@/lib/paths";
import { GoogleTranslateButton } from "@/components/GoogleTranslateButton";
import { useContentLang } from "@/lib/useContentLang";

type Props = {
  building: Building;
  offices: Office[];
  initialLang: Lang;
};

export function BuildingView({ building, offices, initialLang }: Props) {
  const { lang } = useContentLang(initialLang);
  const copy = t(lang);
  const loc = building[lang];
  const maps =
    building.lat != null && building.lng != null
      ? `https://www.google.com/maps?q=${building.lat},${building.lng}`
      : null;
  const spaces = offices.filter((o) => o.published);

  return (
    <div className="min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <header className="border-b-4 border-gold bg-gradient-to-br from-[#061833] via-navy to-[#1a4d96] text-white">
        <div className="mx-auto max-w-xl px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="shrink-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <img
                src="/assets/logo-vertical.png"
                alt={copy.brand}
                className="h-12 w-auto rounded-lg bg-white px-2 py-1 shadow-sm sm:h-14 sm:rounded-xl"
              />
            </Link>
            <GoogleTranslateButton pageLang={lang} />
          </div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold sm:text-[0.7rem]">
            {copy.brand}
          </p>
          <h1 className="font-display mt-1 text-[1.65rem] font-bold leading-tight sm:text-2xl">
            {loc.name}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-3 px-4 py-5 sm:space-y-4 sm:px-5 sm:py-7 sm:pb-20">
        <div className="rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.07)] sm:p-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-navy">
            {loc.island}
          </p>
          <p className="mt-1 text-base font-semibold text-ink sm:text-lg">{loc.school}</p>
          {loc.notes ? (
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">{loc.notes}</p>
          ) : null}
        </div>

        <Section title={copy.departments} items={loc.departments} />

        <section className="rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.06)] sm:p-5">
          <h2 className="font-display mb-2 text-lg font-bold sm:mb-3 sm:text-xl">
            {copy.officesList}
          </h2>
          <ul className="divide-y divide-line/80">
            {spaces.map((o) => {
              const ol = o[lang];
              return (
                <li key={o.id}>
                  <Link
                    href={`/o/${officeSlug(o)}`}
                    className="flex min-h-12 items-start gap-3 py-3.5 text-[0.9375rem] leading-snug text-navy active:bg-paper/80"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>
                      {o.code ? (
                        <strong className="mr-1.5 font-bold">{o.code}</strong>
                      ) : null}
                      {ol.occupant || ol.label}
                      {ol.title ? (
                        <span className="block text-sm text-muted sm:ml-0 sm:inline sm:before:content-['·_']">
                          {ol.title}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.06)] sm:p-5">
          <h2 className="font-display mb-2 text-lg font-bold sm:mb-3 sm:text-xl">
            {copy.address}
          </h2>
          <p className="text-[0.9375rem] leading-relaxed">{loc.address}</p>
          {maps ? (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white active:bg-navy-2 sm:w-auto"
            >
              {copy.map}
            </a>
          ) : null}
        </section>

        <section className="space-y-2.5 rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.06)] sm:space-y-3 sm:p-5">
          <h2 className="font-display text-lg font-bold sm:text-xl">{copy.contact}</h2>
          {building.phone ? (
            <a
              className="flex min-h-12 flex-col justify-center gap-0.5 rounded-xl bg-paper px-4 py-3 active:bg-[#efe8d6] sm:flex-row sm:items-center sm:gap-3"
              href={`tel:${building.phone.replace(/\s/g, "")}`}
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                {copy.phone}
              </span>
              <span className="text-base font-semibold text-navy sm:ml-auto sm:text-sm">
                {building.phone}
              </span>
            </a>
          ) : null}
          {building.email ? (
            <a
              className="flex min-h-12 flex-col justify-center gap-0.5 rounded-xl bg-paper px-4 py-3 active:bg-[#efe8d6] sm:flex-row sm:items-center sm:gap-3"
              href={`mailto:${building.email}`}
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                {copy.email}
              </span>
              <span className="break-all text-base font-semibold text-navy sm:ml-auto sm:text-sm">
                {building.email}
              </span>
            </a>
          ) : null}
        </section>

        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 py-2 text-[0.9375rem] font-semibold text-navy"
        >
          ← {copy.backHome}
        </Link>
      </main>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.06)] sm:p-5">
      <h2 className="font-display mb-2 text-lg font-bold sm:mb-3 sm:text-xl">{title}</h2>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[0.9375rem] leading-snug">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
