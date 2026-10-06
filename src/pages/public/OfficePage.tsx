import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useContentLang } from "@/lib/lang";
import { buildingPath, formatDate, officeHeadline, officePath, officeSlug, telHref } from "@/lib/office";
import { useAsync } from "@/lib/useAsync";
import { Masthead, PublicFooter } from "@/components/public/Masthead";
import { Plate } from "@/components/public/Plate";
import { TranslateButton } from "@/components/public/TranslateButton";
import { PublicError, PublicSkeleton } from "./PublicStates";

export default function OfficePage() {
  const { slug = "" } = useParams();
  const lang = useContentLang();
  const copy = t(lang);
  const navigate = useNavigate();
  const res = useAsync(() => api.publicOffice(slug), [slug]);

  const office = res.data?.office;
  const building = res.data?.building;

  // Canonical URL: an id-based link redirects to the door code
  useEffect(() => {
    if (office && officeSlug(office) !== slug) navigate(officePath(office) + window.location.search, { replace: true });
  }, [office, slug, navigate]);

  useEffect(() => {
    if (office) document.title = `${officeHeadline(office, lang).headline} · ${office.code || copy.kind[office.kind]} · ${copy.brand}`;
  }, [office, lang, copy]);

  if (res.status === "loading") return <PublicSkeleton lang={lang} />;
  if (res.status === "error" || !office) return <PublicError lang={lang} error={res.error} onRetry={res.reload} />;

  const loc = office[lang];
  const { headline, sub } = officeHeadline(office, lang);
  const buildingName = building ? `${copy.building} ${building.code || ""}`.trim() : "";
  const department = loc.department || office.el.department;
  const notes = loc.notes || (lang === "en" ? "" : office.el.notes);

  return (
    <div className="min-h-dvh">
      <Masthead lang={lang} right={<TranslateButton lang={lang} />} />
      <Plate
        numeral={office.code || undefined}
        numeralLabel={copy.kind[office.kind]}
        meta={
          <>
            {copy.kind[office.kind]}
            {buildingName ? <span className="block text-white/90">{buildingName}</span> : null}
          </>
        }
        title={headline}
        subtitle={sub}
      />

      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        {office.phone || office.email ? (
          <section aria-label={copy.contact} className="grid gap-2.5 pt-5 min-[440px]:grid-flow-col min-[440px]:auto-cols-fr">
            {office.phone ? (
              <ContactAction href={telHref(office.phone)} icon={<Phone className="size-5" />} label={copy.call} value={office.phone} primary />
            ) : null}
            {office.email ? (
              <ContactAction href={`mailto:${office.email}`} icon={<Mail className="size-5" />} label={copy.email} value={office.email} primary={!office.phone} />
            ) : null}
          </section>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-card)]">
          <dl className="divide-y divide-line/80">
            {department ? <Detail term={copy.departmentLabel}>{department}</Detail> : null}
            {building ? (
              <Detail term={copy.building}>
                <Link to={buildingPath(building)} className="group inline-flex items-center gap-1.5 font-semibold text-sea hover:underline">
                  {building[lang].name || building.el.name}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                {building[lang].address ? <span className="mt-0.5 block text-[0.875rem] text-muted">{building[lang].address}</span> : null}
              </Detail>
            ) : null}
            {notes ? (
              <Detail term={copy.notes}>
                <span className="whitespace-pre-line leading-relaxed">{notes}</span>
              </Detail>
            ) : null}
          </dl>
        </section>

        <p className="mt-6">
          <Link
            to={building ? buildingPath(building) : "/"}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-sea hover:underline"
          >
            {building ? copy.backToBuilding : copy.allSpaces}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      </main>

      <PublicFooter lang={lang} updatedAt={formatDate(office.updatedAt, lang)} />
    </div>
  );
}

function ContactAction({ href, icon, label, value, primary }: { href: string; icon: ReactNode; label: string; value: string; primary?: boolean }) {
  return (
    <a
      href={href}
      className={
        primary
          ? "group flex min-h-[4.25rem] items-center gap-3.5 rounded-2xl bg-sea px-4 text-white shadow-[var(--shadow-card)] transition-colors hover:bg-sea-2 active:bg-sea-deep"
          : "group flex min-h-[4.25rem] items-center gap-3.5 rounded-2xl border border-line bg-card px-4 text-sea shadow-[var(--shadow-card)] transition-colors hover:border-sea/30 active:bg-paper-2"
      }
    >
      <span className={primary ? "grid size-10 shrink-0 place-items-center rounded-full bg-stone text-sea-deep" : "grid size-10 shrink-0 place-items-center rounded-full bg-paper-2 text-sea"}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className={primary ? "block text-[0.8125rem] font-semibold text-white/90" : "block text-[0.8125rem] font-semibold text-muted"}>{label}</span>
        <span className="nums block truncate text-[1.0625rem] font-semibold">{value}</span>
      </span>
    </a>
  );
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:px-5">
      <dt className="text-[0.8125rem] font-semibold text-muted sm:pt-0.5">{term}</dt>
      <dd className="text-[1rem] text-ink">{children}</dd>
    </div>
  );
}
