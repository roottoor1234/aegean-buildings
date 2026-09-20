import { headers } from "next/headers";
import { readBuildings } from "@/lib/buildings";
import { readOffices } from "@/lib/offices";
import { HomeClient } from "@/components/HomeClient";
import { getRequestOrigin } from "@/lib/origin";
import { officeSlug, officeUrl } from "@/lib/paths";
import { generateQrDataUrls } from "@/lib/qr-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const origin = await getRequestOrigin();
  const [buildings, offices] = await Promise.all([readBuildings(), readOffices()]);

  const published = offices.filter((o) => o.published);
  const qrImages = await generateQrDataUrls(
    published.map((o) => ({
      id: o.id,
      url: officeUrl(officeSlug(o), origin),
    })),
  );

  // Prefer the live request host when available (LAN / preview).
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const requestOrigin = host ? `${proto}://${host}` : origin;

  return (
    <HomeClient
      buildings={buildings}
      offices={offices}
      origin={requestOrigin}
      qrImages={qrImages}
    />
  );
}
