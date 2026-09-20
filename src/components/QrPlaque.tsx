"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Spinner } from "@/components/Spinner";

type Props = {
  url: string;
  title: string;
  subtitle?: string;
  size?: number;
  className?: string;
};

const LOGO_SRC = "/assets/logo-mark.png";
let logoPromise: Promise<HTMLImageElement | null> | null = null;

function getLogo(): Promise<HTMLImageElement | null> {
  if (!logoPromise) {
    logoPromise = loadImage(LOGO_SRC).catch(() => null);
  }
  return logoPromise;
}

export function QrPlaque({ url, title, subtitle, size = 640, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  // Draw only when the plaque scrolls into view (avoids 30+ concurrent canvas jobs).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !url) return;
    let cancelled = false;
    setReady(false);
    setError(null);

    (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const logo = await getLogo();
        if (cancelled) return;
        await drawPlaque(canvas, url, title, subtitle || "", logo, size);
        if (!cancelled) {
          setError(null);
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, url, title, subtitle, size]);

  return (
    <div
      ref={wrapRef}
      className="relative grid w-full min-h-[260px] place-items-center"
    >
      {error ? (
        <p className="absolute inset-x-2 top-2 z-10 text-center text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!ready ? (
        <div className="absolute inset-0 z-[1] grid place-items-center rounded-md bg-navy/5 text-navy">
          <Spinner size="md" label="Φόρτωση QR…" className="text-navy" />
        </div>
      ) : null}

      <canvas
        ref={canvasRef}
        className={`${className || "w-full h-auto rounded-md shadow-lg"} ${
          ready ? "relative opacity-100" : "pointer-events-none absolute opacity-0"
        } transition-opacity duration-200`}
      />
    </div>
  );
}

export async function downloadPlaquePng(
  url: string,
  title: string,
  subtitle: string,
  filename: string,
  size = 960,
) {
  const canvas = document.createElement("canvas");
  const logo = await getLogo();
  await drawPlaque(canvas, url, title, subtitle, logo, size);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Logo failed to load"));
    img.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width <= maxWidth) line = t;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

async function drawPlaque(
  canvas: HTMLCanvasElement,
  url: string,
  title: string,
  subtitle: string,
  logo: HTMLImageElement | null,
  targetPx: number,
) {
  const qrPx = Math.max(256, Math.round(targetPx * 0.72));
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, url, {
    errorCorrectionLevel: "H",
    width: qrPx,
    margin: 2,
    color: { dark: "#1a4db8", light: "#ffffff" },
  });

  const pad = Math.round(qrPx * 0.08);
  const titleH = Math.round(qrPx * 0.24);
  const W = qrPx + pad * 2;
  const H = pad + qrPx + titleH + Math.round(pad * 0.5);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  ctx.fillStyle = "#0b2a5b";
  roundedRect(ctx, 0, 0, W, H, Math.round(W * 0.035));
  ctx.fill();
  ctx.fillStyle = "#c9a227";
  const bar = Math.max(5, Math.round(H * 0.012));
  ctx.fillRect(0, 0, W, bar);
  ctx.fillRect(0, H - bar, W, bar);

  const qx = pad;
  const qy = pad;
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, qx - 3, qy - 3, qrPx + 6, qrPx + 6, 12);
  ctx.fill();
  ctx.drawImage(qrCanvas, qx, qy, qrPx, qrPx);

  if (logo && logo.naturalWidth > 0) {
    const mark = Math.round(qrPx * 0.18);
    const cx = qx + qrPx / 2;
    const cy = qy + qrPx / 2;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, mark / 2 + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2;
    ctx.stroke();
    const scale = Math.min((mark * 0.88) / logo.width, (mark * 0.88) / logo.height);
    const dw = logo.width * scale;
    const dh = logo.height * scale;
    ctx.drawImage(logo, cx - dw / 2, cy - dh / 2, dw, dh);
  }

  const ty = qy + qrPx + Math.round(pad * 0.45);
  ctx.fillStyle = "#e8c96a";
  ctx.font = `600 ${Math.round(W * 0.032)}px "Source Sans 3", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΙΓΑΙΟΥ", W / 2, ty + Math.round(W * 0.03));

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.round(W * 0.048)}px "Cormorant Garamond", Georgia, serif`;
  wrapLines(ctx, title || "Χώρος", W * 0.84).forEach((ln, i) => {
    ctx.fillText(ln, W / 2, ty + Math.round(W * 0.082) + i * Math.round(W * 0.052));
  });
  if (subtitle) {
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.font = `600 ${Math.round(W * 0.028)}px "Source Sans 3", sans-serif`;
    ctx.fillText(subtitle, W / 2, H - Math.round(pad * 0.45));
  }
}
