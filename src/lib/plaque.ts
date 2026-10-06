import QRCode from "qrcode";

/**
 * The printed door plaque: sea-blue field, grey rules top and bottom,
 * QR in a white well with the ΤΠΤΕ department mark at its centre,
 * the room numeral and the name in white Garamond, "Κτίριο · Πανεπιστήμιο Αιγαίου" beneath.
 */

/**
 * Plaque palette, taken from the ΤΠΤΕ logo: its sea blue for the field,
 * its grey for the rules, and a deeper shade of that grey for the modules
 * (the logo grey itself is only ~2.6:1 on white, too faint for phone cameras).
 */
const PLAQUE = {
  field: "#156ba8", // logo blue
  rule: "#a2a39a", // logo grey
  module: "#5f6058", // logo grey, deepened for scan contrast (~6:1 on white)
  frame: "#156ba8",
  numeral: "#ffffff",
  footer: "rgba(255,255,255,0.78)",
} as const;

export type PlaqueSpec = {
  url: string;
  /** Room numeral, set large under the QR */
  code?: string;
  title: string;
  /** Footer line, e.g. "Κτίριο 1" */
  subtitle?: string;
};

// The department mark sits in the QR; the university seal stays the favicon
const LOGO_SRC = `${import.meta.env.BASE_URL}assets/logo-tpte.png`;
let logoPromise: Promise<HTMLImageElement | null> | null = null;
let fontsPromise: Promise<unknown> | null = null;

function getLogo() {
  logoPromise ??= new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_SRC;
  });
  return logoPromise;
}

function ensureFonts() {
  // Every weight the canvas draws must be loaded, or it silently falls back to Georgia (oldstyle figures)
  fontsPromise ??= Promise.all([
    document.fonts.load('500 48px "EB Garamond"', "0123456789."),
    document.fonts.load('600 48px "EB Garamond"', "ΑΒΓ Aa"),
    document.fonts.load('600 32px "Source Sans 3"', "ΑΒΓ Aa"),
  ]).catch(() => null);
  return fontsPromise;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, max = 2) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > max) {
    const kept = lines.slice(0, max);
    kept[max - 1] = `${kept[max - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return lines;
}

export async function drawPlaque(canvas: HTMLCanvasElement, spec: PlaqueSpec, targetPx = 960) {
  const [logo] = await Promise.all([getLogo(), ensureFonts()]);

  const qrPx = Math.max(256, Math.round(targetPx * 0.72));
  const qr = QRCode.create(spec.url, { errorCorrectionLevel: "H" });

  const pad = Math.round(qrPx * 0.08);
  const textBlock = Math.round(qrPx * 0.38);
  const W = qrPx + pad * 2;
  const H = pad + qrPx + textBlock + Math.round(pad * 0.4);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  // Field
  ctx.fillStyle = PLAQUE.field;
  roundedRect(ctx, 0, 0, W, H, Math.round(W * 0.035));
  ctx.fill();

  // Grey rules
  ctx.save();
  roundedRect(ctx, 0, 0, W, H, Math.round(W * 0.035));
  ctx.clip();
  const bar = Math.max(6, Math.round(H * 0.013));
  ctx.fillStyle = PLAQUE.rule;
  ctx.fillRect(0, 0, W, bar);
  ctx.fillRect(0, H - bar, W, bar);
  ctx.restore();

  // QR well
  const qx = pad;
  const qy = pad;
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, qx - 4, qy - 4, qrPx + 8, qrPx + 8, Math.round(qrPx * 0.03));
  ctx.fill();

  // Modules on a whole-pixel grid (no seams), 2-module quiet zone.
  // A centred square of whole modules is left empty for the department mark:
  // it reads as a window cut into the code, not a sticker on top of it.
  const n = qr.modules.size;
  const quiet = 2;
  const cell = Math.floor(qrPx / (n + quiet * 2));
  const ox = qx + Math.round((qrPx - cell * (n + quiet * 2)) / 2) + quiet * cell;
  const oy = qy + Math.round((qrPx - cell * (n + quiet * 2)) / 2) + quiet * cell;
  const hasLogo = !!logo && logo.naturalWidth > 0;
  // Odd width keeps it centred on the grid; ~26% of the side is ~7% of the area (level H recovers ~30%)
  const k = hasLogo ? Math.max(7, Math.round(n * 0.26) | 1) : 0;
  const k0 = (n - k) / 2;
  const inWindow = (r: number, c: number) => k > 0 && r >= k0 && r < k0 + k && c >= k0 && c < k0 + k;

  ctx.fillStyle = PLAQUE.module;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c) && !inWindow(r, c)) ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
    }
  }

  // Department mark in its square window, framed by a thin blue rule
  if (hasLogo && logo) {
    const wx = ox + k0 * cell;
    const wy = oy + k0 * cell;
    const ws = k * cell;
    const inset = Math.round(cell * 0.45);
    const line = Math.max(2, Math.round(cell * 0.14));
    ctx.strokeStyle = PLAQUE.frame;
    ctx.lineWidth = line;
    roundedRect(ctx, wx + inset + line / 2, wy + inset + line / 2, ws - 2 * inset - line, ws - 2 * inset - line, Math.round(cell * 0.35));
    ctx.stroke();
    const room = ws - 2 * (inset + line + Math.round(cell * 0.55));
    const scale = Math.min(room / logo.width, room / logo.height);
    const dw = logo.width * scale;
    const dh = logo.height * scale;
    ctx.drawImage(logo, wx + (ws - dw) / 2, wy + (ws - dh) / 2, dw, dh);
  }

  // Lettering: the room numeral leads in Garamond, the name beneath it
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const top = qy + qrPx + 4;
  let y = top;

  if (spec.code) {
    const codeSize = Math.round(W * 0.1);
    ctx.fillStyle = PLAQUE.numeral;
    ctx.font = `500 ${codeSize}px "EB Garamond", Georgia, serif`;
    y += Math.round(codeSize * 1.02);
    ctx.fillText(spec.code, W / 2, y);
  }

  ctx.fillStyle = "#ffffff";
  const titleSize = Math.round(W * (spec.code ? 0.05 : 0.058));
  ctx.font = `600 ${titleSize}px "EB Garamond", Georgia, serif`;
  const lines = wrapLines(ctx, spec.title || "Χώρος", W * 0.86);
  const lineH = Math.round(titleSize * 1.08);
  y += Math.round(titleSize * (spec.code ? 1.35 : 1.9));
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, y + i * lineH));

  const footer = [spec.subtitle, "Πανεπιστήμιο Αιγαίου"].filter(Boolean).join("  ·  ");
  ctx.fillStyle = PLAQUE.footer;
  ctx.font = `600 ${Math.round(W * 0.027)}px "Source Sans 3", sans-serif`;
  ctx.fillText(footer, W / 2, H - bar - Math.round(pad * 0.55));
}

export async function plaqueBlob(spec: PlaqueSpec, size = 1200): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await drawPlaque(canvas, spec, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png"),
  );
}

export async function downloadPlaque(spec: PlaqueSpec, filename: string) {
  const blob = await plaqueBlob(spec);
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}

/** What goes on an office's plaque: the Greek headline and "code · Κτίριο N". */
export function officePlaqueSpec(
  office: { code: string; id: string; kind: string; el: { occupant: string; title: string; label: string } },
  buildingCode: string | undefined,
  url: string,
): PlaqueSpec {
  const title = office.el.occupant || office.el.title || office.el.label || office.code;
  const subtitle = buildingCode ? `Κτίριο ${buildingCode}` : "";
  return { url, code: office.code, title, subtitle };
}
