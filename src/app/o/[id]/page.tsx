import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { getOffice } from "@/lib/offices";
import { OfficeView } from "@/components/OfficeView";
import { detectLangFromAcceptLanguage } from "@/lib/lang";
import { officePath, officeSlug } from "@/lib/paths";
import { PageLoader } from "@/components/Spinner";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OfficePage({ params }: Props) {
  const { id: raw } = await params;
  const office = await getOffice(raw);
  if (!office || !office.published) notFound();

  const pretty = officeSlug(office);
  if (decodeURIComponent(raw) !== pretty) {
    redirect(officePath(pretty));
  }

  const hdrs = await headers();
  const initialLang = detectLangFromAcceptLanguage(hdrs.get("accept-language"));
  return (
    <Suspense fallback={<PageLoader />}>
      <OfficeView office={office} initialLang={initialLang} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id: raw } = await params;
  const office = await getOffice(raw);
  if (!office) return { title: "Not found" };
  const hdrs = await headers();
  const lang = detectLangFromAcceptLanguage(hdrs.get("accept-language"));
  const name = office[lang].occupant || office[lang].label;
  return { title: `${name} | Πανεπιστήμιο Αιγαίου` };
}
