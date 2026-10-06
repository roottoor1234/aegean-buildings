import { Link } from "react-router";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { ApiError } from "@/lib/api";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { Masthead, PublicFooter } from "@/components/public/Masthead";
import { Plate } from "@/components/public/Plate";
import { Button, Skeleton } from "@/components/ui";

export function PublicSkeleton({ lang }: { lang: Lang }) {
  return (
    <div className="min-h-dvh" aria-busy="true">
      <Masthead lang={lang} />
      <div className="bg-sea">
        <div className="mx-auto max-w-2xl px-4 pb-10 pt-8 sm:px-6">
          <div className="h-16 w-40 rounded-md bg-white/10" />
          <div className="my-6 h-px bg-stone/40" />
          <div className="h-9 w-3/4 rounded-md bg-white/10" />
          <div className="mt-3 h-5 w-1/3 rounded-md bg-white/10" />
        </div>
        <div className="h-1.5 bg-stone" />
      </div>
      <div className="mx-auto max-w-2xl space-y-3 px-4 pt-5 sm:px-6">
        <Skeleton className="h-[4.25rem] rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  );
}

export function PublicError({ lang, error, onRetry }: { lang: Lang; error?: ApiError; onRetry: () => void }) {
  const copy = t(lang);
  const notFound = !error || error.status === 404;
  // The scanned code, if the dead link was a door or building URL
  const m = window.location.pathname.match(/\/(?:o|b)\/([^/]+)\/?$/);
  const scanned = m ? decodeURIComponent(m[1]) : undefined;
  return (
    <div className="min-h-dvh">
      <Masthead lang={lang} />
      <Plate
        numeral={scanned && scanned.length <= 8 ? scanned : "—"}
        meta={notFound ? copy.permanent : undefined}
        title={notFound ? copy.notFoundTitle : copy.loadError}
        subtitle={notFound ? copy.notFoundBody : error?.message}
      />
      <main className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-sea px-5 font-semibold text-white transition-colors hover:bg-sea-2"
          >
            {copy.allSpaces}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          {!notFound ? (
            <Button size="lg" onClick={onRetry} icon={<RefreshCw className="size-4" />}>
              {copy.retry}
            </Button>
          ) : null}
        </div>
      </main>
      <PublicFooter lang={lang} />
    </div>
  );
}
