import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Check, Download, ExternalLink, Link2, Pencil, QrCode, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";
import { absoluteUrl, officeHeadline, officeMatches, officePath, safeFilename } from "@/lib/office";
import { downloadPlaque, officePlaqueSpec } from "@/lib/plaque";
import type { Building, Office } from "@/lib/types";
import { useAsync } from "@/lib/useAsync";
import { PlaquePreview } from "@/components/admin/PlaquePreview";
import { Badge, Button, EmptyState, ErrorNotice, IconButton, Segmented, Select, Skeleton, useToast } from "@/components/ui";
import { AdminPage } from "./AdminLayout";

export default function PlaquesPage() {
  const { can } = useAuth();
  const toast = useToast();
  const res = useAsync(() => Promise.all([api.offices(), api.buildings()]), []);
  const [query, setQuery] = useState("");
  const [building, setBuilding] = useState("all");
  const [status, setStatus] = useState<"all" | "published" | "draft">("published");
  const [batch, setBatch] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    document.title = "Πινακίδες QR · Διαχείριση";
  }, []);

  const [offices, buildings] = res.data ?? [[], []];
  const byId = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings]);
  const list = useMemo(
    () =>
      offices.filter(
        (o) =>
          (building === "all" || o.buildingId === building) &&
          (status === "all" || (status === "published" ? o.published : !o.published)) &&
          officeMatches(o, query),
      ),
    [offices, building, status, query],
  );

  async function downloadAll() {
    setBatch({ done: 0, total: list.length });
    try {
      for (const [i, o] of list.entries()) {
        await downloadOne(o, byId.get(o.buildingId ?? ""));
        setBatch({ done: i + 1, total: list.length });
        await new Promise((r) => setTimeout(r, 220));
      }
      toast("ok", `Κατέβηκαν ${list.length} πινακίδες`);
    } catch {
      toast("err", "Η λήψη διακόπηκε. Δοκιμάστε ξανά.");
    } finally {
      setBatch(null);
    }
  }

  return (
    <AdminPage
      wide
      title="Πινακίδες QR"
      description="Κάθε QR δείχνει σε μόνιμο URL. Τυπώστε το μία φορά και αλλάξτε το περιεχόμενο όποτε χρειαστεί."
      actions={
        <Button variant="primary" icon={<Download className="size-4" />} loading={!!batch} disabled={!list.length || !!batch} onClick={downloadAll}>
          {batch ? `Λήψη ${batch.done}/${batch.total}` : `Λήψη όλων (${list.length})`}
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <span className="sr-only">Αναζήτηση</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Όνομα, ιδιότητα ή αρίθμηση"
            className="h-10 w-full rounded-lg border border-line-strong bg-white pl-9 pr-3 text-[0.9375rem] outline-none placeholder:text-muted/70 focus:border-sea-2 focus:shadow-[0_0_0_3px_rgb(21_107_168/0.14)]"
          />
        </label>
        <Segmented
          label="Κτίριο"
          value={building}
          onChange={setBuilding}
          options={[
            { value: "all", label: "Όλα", count: offices.length },
            ...buildings.map((b) => ({ value: b.id, label: `Κτίριο ${b.code}`, count: offices.filter((o) => o.buildingId === b.id).length })),
          ]}
        />
        <Select aria-label="Κατάσταση" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-auto!">
          <option value="published">Δημοσιευμένα</option>
          <option value="draft">Πρόχειρα</option>
          <option value="all">Όλα</option>
        </Select>
      </div>

      {res.status === "error" ? <ErrorNotice message={res.error.message} onRetry={res.reload} /> : null}

      {res.status === "loading" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14.5rem,1fr))] gap-x-6 gap-y-10">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[535/688] rounded-xl" />
          ))}
        </div>
      ) : res.status === "ok" && list.length === 0 ? (
        <EmptyState icon={<QrCode className="size-5" />} title="Καμία πινακίδα εδώ">
          {query ? "Δεν ταιριάζει κανένας χώρος με την αναζήτηση." : "Αλλάξτε φίλτρο για να δείτε και τα πρόχειρα."}
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(14.5rem,1fr))] gap-x-6 gap-y-10">
          {list.map((o) => (
            <PlaqueTile key={o.id} office={o} building={byId.get(o.buildingId ?? "")} editable={can("edit")} />
          ))}
        </ul>
      )}
    </AdminPage>
  );
}

async function downloadOne(o: Office, b: Building | undefined) {
  const spec = officePlaqueSpec(o, b?.code, absoluteUrl(officePath(o)));
  await downloadPlaque(spec, `QR_${safeFilename(o.code || spec.title)}.png`);
}

function PlaqueTile({ office, building, editable }: { office: Office; building?: Building; editable: boolean }) {
  const toast = useToast();
  const url = absoluteUrl(officePath(office));
  const spec = useMemo(() => officePlaqueSpec(office, building?.code, url), [office, building?.code, url]);
  const { headline } = officeHeadline(office, "el");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <li className="group flex flex-col">
      <div className="relative transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
        <PlaquePreview spec={spec} />
        {!office.published ? (
          <Badge tone="warn" className="absolute right-3 top-4 shadow-sm">
            Πρόχειρο · δεν φαίνεται δημόσια
          </Badge>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-semibold text-ink">{headline}</p>
          <p className="nums truncate text-[0.8125rem] text-muted">{url.replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1">
        <Button
          size="sm"
          variant="sea"
          icon={<Download className="size-3.5" />}
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await downloadOne(office, building);
            } catch {
              toast("err", "Η λήψη απέτυχε.");
            } finally {
              setBusy(false);
            }
          }}
        >
          PNG
        </Button>
        <IconButton
          label={copied ? "Αντιγράφηκε" : "Αντιγραφή συνδέσμου"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              toast("err", "Δεν επιτρέπεται η αντιγραφή σε αυτόν τον browser.");
            }
          }}
        >
          {copied ? <Check className="size-4 text-ok" /> : <Link2 className="size-4" />}
        </IconButton>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label="Άνοιγμα δημόσιας σελίδας"
          title="Άνοιγμα δημόσιας σελίδας"
          className="grid size-9 place-items-center rounded-lg text-sea transition-colors hover:bg-sea/[0.06]"
        >
          <ExternalLink className="size-4" />
        </a>
        {editable ? (
          <Link
            to={`/admin/spaces/${office.id}`}
            aria-label="Επεξεργασία"
            title="Επεξεργασία"
            className="grid size-9 place-items-center rounded-lg text-sea transition-colors hover:bg-sea/[0.06]"
          >
            <Pencil className="size-4" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}
