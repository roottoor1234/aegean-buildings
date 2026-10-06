import { Link } from "react-router";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

const logo = `${import.meta.env.BASE_URL}assets/logo-aegean.png`;

/** University lockup strip shared by every public page. */
export function Masthead({ lang, right }: { lang: Lang; right?: ReactNode }) {
  const copy = t(lang);
  return (
    <div className="on-sea bg-sea-deep text-white">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3 rounded-md" aria-label={copy.allSpaces}>
          <img src={logo} alt={copy.brand} width={228} height={83} className="h-9 w-auto shrink-0" />
          <span className="hidden h-7 w-px bg-white/20 min-[400px]:block" aria-hidden />
          <span className="hidden min-w-0 text-[0.8125rem] font-semibold leading-tight text-white/80 min-[400px]:block">
            {copy.departmentShort}
            <span className="block font-normal text-white/75">{copy.product}</span>
          </span>
        </Link>
        {right}
      </div>
    </div>
  );
}

export function PublicFooter({ lang, updatedAt }: { lang: Lang; updatedAt?: string }) {
  const copy = t(lang);
  return (
    <footer className="mx-auto max-w-2xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5 text-[0.8125rem] text-muted">
        <p>
          {copy.brand} · {copy.department}
          {updatedAt ? (
            <>
              <br />
              {copy.permanent} · {copy.updated} {updatedAt}
            </>
          ) : null}
        </p>
        <Link to="/login" className="font-semibold text-sea underline decoration-line-strong hover:decoration-sea">
          {copy.staffSignIn}
        </Link>
      </div>
    </footer>
  );
}
