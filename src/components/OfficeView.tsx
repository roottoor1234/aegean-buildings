"use client";

import Link from "next/link";
import type { Lang, Office } from "@/lib/types";
import { t } from "@/lib/i18n";
import { buildingSlug, officeSlug } from "@/lib/paths";
import { GoogleTranslateButton } from "@/components/GoogleTranslateButton";
import { useContentLang } from "@/lib/useContentLang";

type Props = { office: Office; initialLang: Lang };

export function OfficeView({ office, initialLang }: Props) {
  const { lang } = useContentLang(initialLang);
  const copy = t(lang);
  const loc = office[lang];
  const headline = loc.occupant || loc.label;

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
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold sm:text-[0.7rem] sm:tracking-[0.18em]">
            {copy.brand}
          </p>
          <h1 className="font-display mt-1 text-[1.65rem] font-bold leading-tight sm:text-2xl">
            {headline}
          </h1>
          {office.code ? (
            <p className="mt-1 text-sm text-white/70">{office.code}</p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-3 px-4 py-5 sm:space-y-4 sm:px-5 sm:py-7 sm:pb-20">
        <section className="space-y-1.5 rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.07)] sm:space-y-2 sm:p-5">
          {loc.occupant ? (
            <p className="text-[0.8125rem] font-medium text-muted">{loc.label}</p>
          ) : null}
          {loc.title ? (
            <p className="text-base font-semibold leading-snug text-ink sm:text-lg">
              {loc.title}
            </p>
          ) : null}
          {loc.department ? (
            <p className="text-[0.9375rem] leading-snug text-ink/85">{loc.department}</p>
          ) : null}
          {loc.building ? (
            <p className="text-sm text-muted">{loc.building}</p>
          ) : null}
        </section>

        {(office.phone || office.email) && (
          <section className="space-y-2.5 rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.06)] sm:space-y-3 sm:p-5">
            <h2 className="font-display text-lg font-bold sm:text-xl">{copy.contact}</h2>
            {office.phone ? (
              <a
                className="flex min-h-12 flex-col justify-center gap-0.5 rounded-xl bg-paper px-4 py-3 active:bg-[#efe8d6] sm:flex-row sm:items-center sm:gap-3"
                href={`tel:${office.phone.replace(/\s/g, "")}`}
              >
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                  {copy.phone}
                </span>
                <span className="text-base font-semibold text-navy sm:ml-auto sm:text-sm">
                  {office.phone}
                </span>
              </a>
            ) : null}
            {office.email ? (
              <a
                className="flex min-h-12 flex-col justify-center gap-0.5 rounded-xl bg-paper px-4 py-3 active:bg-[#efe8d6] sm:flex-row sm:items-center sm:gap-3"
                href={`mailto:${office.email}`}
              >
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                  {copy.email}
                </span>
                <span className="break-all text-base font-semibold text-navy sm:ml-auto sm:text-sm">
                  {office.email}
                </span>
              </a>
            ) : null}
          </section>
        )}

        {loc.notes ? (
          <section className="rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_24px_rgba(11,42,91,0.06)] sm:p-5">
            <h2 className="font-display mb-2 text-lg font-bold sm:text-xl">{copy.notes}</h2>
            <p className="text-[0.9375rem] leading-relaxed text-ink/90">{loc.notes}</p>
          </section>
        ) : null}

        {office.buildingId ? (
          <Link
            href={`/b/${buildingSlug({ id: office.buildingId || "", buildingCode: office.buildingCode })}`}
            className="inline-flex min-h-11 items-center gap-1 py-2 text-[0.9375rem] font-semibold text-navy"
          >
            ← {loc.building || copy.buildings}
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 py-2 text-[0.9375rem] font-semibold text-navy"
          >
            ← {copy.backHome}
          </Link>
        )}
      </main>
    </div>
  );
}
