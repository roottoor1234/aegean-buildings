import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronRight, DoorOpen, Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import { officeHeadline, officeMatches, relativeTime } from "@/lib/office";
import type { OfficeKind } from "@/lib/types";
import { useAsync } from "@/lib/useAsync";
import { ButtonLink, EmptyState, ErrorNotice, Segmented, Select, Skeleton, StatusDot } from "@/components/ui";
import { AdminPage } from "./AdminLayout";

export const KIND_LABEL: Record<OfficeKind, string> = { office: "Γραφείο", lab: "Εργαστήριο", room: "Αίθουσα" };

export default function SpacesPage() {
  const navigate = useNavigate();
  const res = useAsync(() => Promise.all([api.offices(), api.buildings()]), []);
  const [query, setQuery] = useState("");
  const [building, setBuilding] = useState("all");
  const [kind, setKind] = useState<"all" | OfficeKind>("all");

  useEffect(() => {
    document.title = "Χώροι · Διαχείριση";
  }, []);

  const [offices, buildings] = res.data ?? [[], []];
  const byId = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings]);
  const list = useMemo(
    () =>
      offices.filter(
        (o) => (building === "all" || o.buildingId === building) && (kind === "all" || o.kind === kind) && officeMatches(o, query),
      ),
    [offices, building, kind, query],
  );
  const drafts = offices.filter((o) => !o.published).length;

  return (
    <AdminPage
      title="Χώροι"
      description={
        res.status === "ok" ? (
          <span className="nums">
            {offices.length} χώροι · {drafts ? `${drafts} πρόχειρ${drafts === 1 ? "ο" : "α"}` : "όλοι δημοσιευμένοι"}
          </span>
        ) : (
          " "
        )
      }
      actions={
        <ButtonLink to="/admin/spaces/new" variant="primary" icon={<Plus className="size-4" />}>
          Νέος χώρος
        </ButtonLink>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <span className="sr-only">Αναζήτηση</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Όνομα, ιδιότητα, αρίθμηση, τηλέφωνο"
            className="h-10 w-full rounded-lg border border-line-strong bg-white pl-9 pr-3 text-[0.9375rem] outline-none placeholder:text-muted/70 focus:border-sea-2 focus:shadow-[0_0_0_3px_rgb(21_107_168/0.14)]"
          />
        </label>
        <Segmented
          label="Κτίριο"
          value={building}
          onChange={setBuilding}
          options={[{ value: "all", label: "Όλα" }, ...buildings.map((b) => ({ value: b.id, label: `Κτίριο ${b.code}` }))]}
        />
        <Select aria-label="Είδος" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="w-auto!">
          <option value="all">Όλα τα είδη</option>
          <option value="office">Γραφεία</option>
          <option value="lab">Εργαστήρια</option>
          <option value="room">Αίθουσες</option>
        </Select>
      </div>

      {res.status === "error" ? <ErrorNotice message={res.error.message} onRetry={res.reload} /> : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse text-left text-[0.9375rem]">
          <thead className="hidden border-b border-line bg-paper-2/60 text-[0.8125rem] font-semibold text-muted md:table-header-group">
            <tr>
              <th scope="col" className="w-24 px-5 py-2.5 font-semibold">Αρίθμηση</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Όνομα / χώρος</th>
              <th scope="col" className="hidden px-3 py-2.5 font-semibold lg:table-cell">Επικοινωνία</th>
              <th scope="col" className="hidden px-3 py-2.5 font-semibold xl:table-cell">Τελευταία αλλαγή</th>
              <th scope="col" className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line/80">
            {res.status === "loading"
              ? Array.from({ length: 8 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-3">
                      <Skeleton className="h-9" />
                    </td>
                  </tr>
                ))
              : list.map((o) => {
                  const { headline, sub } = officeHeadline(o, "el");
                  const b = byId.get(o.buildingId ?? "");
                  const go = () => navigate(`/admin/spaces/${o.id}`);
                  return (
                    <tr key={o.id} onClick={go} className="group cursor-pointer transition-colors hover:bg-paper/70">
                      <td className="px-4 py-3 align-top md:px-5">
                        <span className="font-display nums text-xl font-medium leading-none text-stone-ink">{o.code || "—"}</span>
                      </td>
                      <td className="px-3 py-3">
                        <Link to={`/admin/spaces/${o.id}`} className="font-semibold text-ink hover:underline" onClick={(e) => e.stopPropagation()}>
                          {headline}
                        </Link>
                        <span className="block text-[0.8125rem] text-muted">
                          {[sub, KIND_LABEL[o.kind], b ? `Κτίριο ${b.code}` : "χωρίς κτίριο"].filter(Boolean).join(" · ")}
                        </span>
                        {!o.published ? (
                          <span className="mt-1.5 block">
                            <StatusDot published={false} />
                          </span>
                        ) : null}
                      </td>
                      <td className="nums hidden px-3 py-3 text-[0.875rem] text-ink/85 lg:table-cell">
                        {o.phone || <span className="text-muted">χωρίς τηλέφωνο</span>}
                        {o.email ? <span className="block text-muted">{o.email}</span> : null}
                      </td>
                      <td className="hidden px-3 py-3 text-[0.8125rem] text-muted xl:table-cell">
                        {relativeTime(o.updatedAt)}
                        {o.updatedBy ? <span className="block">{o.updatedBy}</span> : null}
                      </td>
                      <td className="pr-4 text-right">
                        <ChevronRight className="inline size-4 text-line-strong group-hover:text-sea" aria-hidden />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {res.status === "ok" && list.length === 0 ? (
          <EmptyState
            icon={<DoorOpen className="size-5" />}
            title={offices.length ? "Κανένας χώρος δεν ταιριάζει" : "Δεν υπάρχουν ακόμη χώροι"}
            action={
              offices.length ? undefined : (
                <ButtonLink to="/admin/spaces/new" variant="primary" icon={<Plus className="size-4" />}>
                  Προσθήκη πρώτου χώρου
                </ButtonLink>
              )
            }
          >
            {offices.length ? "Δοκιμάστε μόνο το επώνυμο ή την αρίθμηση, ή καθαρίστε τα φίλτρα." : "Κάθε χώρος παίρνει μόνιμο URL και πινακίδα QR."}
          </EmptyState>
        ) : null}
      </div>
    </AdminPage>
  );
}
