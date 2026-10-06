import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import type { Lang, Office } from "@/lib/types";
import { officeHeadline, officePath } from "@/lib/office";
import { t } from "@/lib/i18n";

/** A directory row: the door number in Garamond, who or what is behind it. */
export function SpaceRow({ office, lang, showBuilding }: { office: Office; lang: Lang; showBuilding?: string }) {
  const { headline, sub } = officeHeadline(office, lang);
  const copy = t(lang);
  return (
    <li>
      <Link
        to={officePath(office)}
        className="group grid min-h-16 grid-cols-[4.25rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-paper/70 active:bg-paper-2 sm:px-5"
      >
        <span className="font-display nums text-[1.375rem] font-medium leading-none text-stone-ink">
          {office.code || <span className="text-base text-muted">{copy.kind[office.kind]}</span>}
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[1rem] font-semibold leading-snug text-ink">{headline}</span>
          <span className="line-clamp-2 block text-[0.875rem] text-muted">
            {[sub, showBuilding].filter(Boolean).join(" · ") || copy.kind[office.kind]}
          </span>
        </span>
        <ChevronRight className="size-4 text-line-strong transition-transform group-hover:translate-x-0.5 group-hover:text-sea" aria-hidden />
      </Link>
    </li>
  );
}

export function SpaceList({ offices, lang, buildingLabel }: { offices: Office[]; lang: Lang; buildingLabel?: (o: Office) => string | undefined }) {
  return (
    <ul className="divide-y divide-line/80 overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-card)]">
      {offices.map((o) => (
        <SpaceRow key={o.id} office={o} lang={lang} showBuilding={buildingLabel?.(o)} />
      ))}
    </ul>
  );
}
