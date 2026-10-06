import type { ReactNode } from "react";
import { cx } from "@/components/ui";

/**
 * The door plate, on screen. Sea-blue field, a room numeral set large in Garamond,
 * the name in white, and a stone rule that engraves itself in on first paint.
 */
export function Plate({
  numeral,
  numeralLabel,
  meta,
  title,
  subtitle,
  children,
  compact,
  animate = true,
}: {
  numeral?: string;
  numeralLabel?: string;
  meta?: ReactNode;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  compact?: boolean;
  animate?: boolean;
}) {
  const long = (numeral?.length ?? 0) > 5;
  return (
    <div className="on-sea relative overflow-hidden bg-sea text-white">
      <div className={cx("relative mx-auto max-w-2xl px-4 sm:px-6", compact ? "pb-6 pt-5" : "pb-8 pt-7 sm:pb-10 sm:pt-9")}>
        {numeral ? (
          <div className="flex items-end justify-between gap-4">
            <p
              className={cx(
                "font-display nums font-medium leading-[0.82] tracking-[-0.02em] text-stone-soft",
                compact ? "text-5xl" : long ? "text-[3.5rem] sm:text-7xl" : "text-[4.75rem] sm:text-8xl",
              )}
            >
              {numeralLabel ? <span className="sr-only">{numeralLabel} </span> : null}
              {numeral}
            </p>
            {meta ? <div className="pb-1 text-right text-[0.8125rem] font-semibold leading-snug text-white/90">{meta}</div> : null}
          </div>
        ) : meta ? (
          <div className="text-[0.8125rem] font-semibold text-white/90">{meta}</div>
        ) : null}

        <div className={cx("h-px bg-stone/80", compact ? "my-4" : "my-5 sm:my-6", animate && "animate-rule")} aria-hidden />

        <h1 className={cx("font-display font-semibold leading-[1.05] tracking-[-0.01em]", compact ? "text-2xl" : "text-[2.125rem] sm:text-5xl")}>
          {title}
        </h1>
        {subtitle ? <p className={cx("mt-2 text-white/90", compact ? "text-[0.9375rem]" : "text-[1.0625rem] sm:text-lg")}>{subtitle}</p> : null}
        {children}
      </div>
      <div className="relative h-1.5 bg-stone" aria-hidden />
    </div>
  );
}
