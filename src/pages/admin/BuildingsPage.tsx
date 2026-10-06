import { useEffect } from "react";
import { Link } from "react-router";
import { Building2, ChevronRight, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/office";
import { useAsync } from "@/lib/useAsync";
import { ButtonLink, EmptyState, ErrorNotice, Skeleton, StatusDot } from "@/components/ui";
import { AdminPage } from "./AdminLayout";

export default function BuildingsPage() {
  const res = useAsync(() => Promise.all([api.buildings(), api.offices()]), []);
  useEffect(() => {
    document.title = "Κτίρια · Διαχείριση";
  }, []);
  const [buildings, offices] = res.data ?? [[], []];

  return (
    <AdminPage
      title="Κτίρια"
      description="Κάθε κτίριο έχει δική του σελίδα (/b/1) με τη λίστα των χώρων του."
      actions={
        <ButtonLink to="/admin/buildings/new" variant="primary" icon={<Plus className="size-4" />}>
          Νέο κτίριο
        </ButtonLink>
      }
    >
      {res.status === "error" ? <ErrorNotice message={res.error.message} onRetry={res.reload} /> : null}
      {res.status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : buildings.length === 0 && res.status === "ok" ? (
        <EmptyState icon={<Building2 className="size-5" />} title="Δεν υπάρχουν κτίρια" action={<ButtonLink to="/admin/buildings/new" variant="primary">Προσθήκη κτιρίου</ButtonLink>}>
          Οι χώροι οργανώνονται ανά κτίριο.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {buildings.map((b) => {
            const spaces = offices.filter((o) => o.buildingId === b.id);
            const drafts = spaces.filter((o) => !o.published).length;
            return (
              <li key={b.id}>
                <Link
                  to={`/admin/buildings/${b.id}`}
                  className="group flex h-full gap-5 rounded-xl border border-line bg-card p-5 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] hover:border-sea/25 hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="font-display nums grid size-16 shrink-0 place-items-center rounded-lg bg-sea text-4xl font-medium text-stone-soft">
                    {b.code || "·"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-display text-xl font-semibold leading-snug text-ink">{b.el.name}</span>
                      <ChevronRight className="mt-1 size-4 shrink-0 text-line-strong group-hover:text-sea" aria-hidden />
                    </span>
                    <span className="mt-0.5 block text-[0.875rem] text-muted">{[b.el.island, b.el.address].filter(Boolean).join(" · ")}</span>
                    <span className="nums mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.8125rem] text-muted">
                      <StatusDot published={b.published} />
                      <span>
                        {spaces.length} χώροι{drafts ? `, ${drafts} πρόχειρ${drafts === 1 ? "ο" : "α"}` : ""}
                      </span>
                      <span>αλλαγή {relativeTime(b.updatedAt)}</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AdminPage>
  );
}
