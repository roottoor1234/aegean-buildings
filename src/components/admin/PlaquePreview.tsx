import { useEffect, useRef, useState } from "react";
import { drawPlaque, type PlaqueSpec } from "@/lib/plaque";
import { cx } from "@/components/ui";

/** Draws the real printable plaque, only once it scrolls near the viewport. */
export function PlaquePreview({ spec, className }: { spec: PlaqueSpec; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !canvas.current) return;
    let cancelled = false;
    drawPlaque(canvas.current, spec, 640).then(
      () => !cancelled && setReady(true),
      () => !cancelled && setError(true),
    );
    return () => {
      cancelled = true;
    };
  }, [visible, spec.url, spec.code, spec.title, spec.subtitle]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={wrap} className={cx("relative aspect-[535/688] w-full", className)}>
      {!ready ? (
        <div className="absolute inset-0 overflow-hidden rounded-[3.5%] bg-sea">
          <div className="h-[1.3%] bg-stone" />
          <div className="mx-[8%] mt-[8%] aspect-square rounded-md bg-white/[0.07]" />
          {error ? <p className="mt-4 text-center text-xs text-white/70">Το QR δεν σχεδιάστηκε</p> : null}
        </div>
      ) : null}
      <canvas
        ref={canvas}
        aria-label={`Πινακίδα QR: ${spec.title}`}
        role="img"
        className={cx(
          "block h-auto w-full drop-shadow-[0_10px_18px_rgb(16_52_82/0.28)] transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
