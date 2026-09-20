import QRCode from "qrcode";

/** Server-side QR as data URL (no canvas / no browser). */
export async function generateQrDataUrl(text: string, width = 360): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    width,
    margin: 2,
    color: { dark: "#1a4db8", light: "#ffffff" },
  });
}

export async function generateQrDataUrls(
  entries: { id: string; url: string }[],
): Promise<Record<string, string>> {
  const pairs = await Promise.all(
    entries.map(async ({ id, url }) => {
      const src = await generateQrDataUrl(url);
      return [id, src] as const;
    }),
  );
  return Object.fromEntries(pairs);
}
