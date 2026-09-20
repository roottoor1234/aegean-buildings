import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getBuilding } from "@/lib/buildings";
import { readOffices } from "@/lib/offices";
import { BuildingView } from "@/components/BuildingView";
import { detectLangFromAcceptLanguage } from "@/lib/lang";
import { buildingPath, buildingSlug } from "@/lib/paths";
import { PageLoader } from "@/components/Spinner";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BuildingPage({ params }: Props) {
  const { id: raw } = await params;
  const building = await getBuilding(raw);
  if (!building || !building.published) notFound();

  const pretty = buildingSlug(building);
  if (decodeURIComponent(raw) !== pretty) {
    redirect(buildingPath(pretty));
  }

  const offices = (await readOffices()).filter(
    (o) => o.buildingId === building.id || o.buildingCode === building.buildingCode,
  );
  const hdrs = await headers();
  const initialLang = detectLangFromAcceptLanguage(hdrs.get("accept-language"));
  return (
    <Suspense fallback={<PageLoader />}>
      <BuildingView building={building} offices={offices} initialLang={initialLang} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id: raw } = await params;
  const building = await getBuilding(raw);
  if (!building) return { title: "Not found" };
  const hdrs = await headers();
  const lang = detectLangFromAcceptLanguage(hdrs.get("accept-language"));
  return {
    title: `${building[lang].name} | Πανεπιστήμιο Αιγαίου`,
    description: building[lang].notes || building[lang].address,
  };
}
