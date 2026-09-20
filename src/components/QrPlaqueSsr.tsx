type Props = {
  qrSrc: string;
  title: string;
  subtitle?: string;
};

/** Branded QR plaque from SSR-generated QR image — instant, no client canvas. */
export function QrPlaqueSsr({ qrSrc, title, subtitle }: Props) {
  return (
    <div className="overflow-hidden rounded-lg bg-navy shadow-lg">
      <div className="h-1.5 bg-gold" />
      <div className="px-3 pb-3 pt-3">
        <div className="relative overflow-hidden rounded-md bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt=""
            width={360}
            height={360}
            className="block h-auto w-full"
            decoding="async"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-mark.png"
            alt=""
            width={56}
            height={56}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white object-contain p-0.5 ring-2 ring-gold"
          />
        </div>
        <p className="mt-2.5 text-center text-[0.65rem] font-semibold tracking-wide text-[#e8c96a]">
          ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΙΓΑΙΟΥ
        </p>
        <p className="font-display mt-0.5 text-center text-base font-bold leading-snug text-white">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-0.5 text-center text-[0.7rem] font-medium text-white/75">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="h-1.5 bg-gold" />
    </div>
  );
}
