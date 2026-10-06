import { useEffect, useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, Building2, CircleCheck, DoorOpen, Languages, PhoneOff, Plus, QrCode, Trash2, Pencil, UserRound, EyeOff } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/lib/api";
import { officeHeadline, relativeTime } from "@/lib/office";
import type { Activity, Office } from "@/lib/types";
import { useAsync } from "@/lib/useAsync";
import { ButtonLink, ErrorNotice, Skeleton, cx } from "@/components/ui";
import { AdminPage } from "./AdminLayout";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Καλημέρα" : h < 19 ? "Καλησπέρα" : "Καλό βράδυ";
}

type Issue = { key: string; office: Office; reason: string; icon: ReactNode };

export default function OverviewPage() {
  const { user, can } = useAuth();
  const res = useAsync(() => Promise.all([api.offices(), api.buildings(), api.activity(12)]), []);

  useEffect(() => {
    document.title = "Επισκόπηση · Διαχείριση";
  }, []);

  const [offices, buildings, activity] = res.data ?? [[], [], []];
  const published = offices.filter((o) => o.published).length;

  const issues = useMemo<Issue[]>(() => {
    const out: Issue[] = [];
    for (const o of offices) {
      if (!o.published) out.push({ key: `${o.id}-d`, office: o, reason: "Πρόχειρο: το QR δείχνει «δεν βρέθηκε»", icon: <EyeOff className="size-4" /> });
      else if (!o.phone && !o.email) out.push({ key: `${o.id}-c`, office: o, reason: "Χωρίς τηλέφωνο ή email", icon: <PhoneOff className="size-4" /> });
      if ((o.el.occupant && !o.en.occupant) || (o.el.title && !o.en.title))
        out.push({ key: `${o.id}-e`, office: o, reason: "Λείπει η αγγλική απόδοση", icon: <Languages className="size-4" /> });
      if (!o.buildingId) out.push({ key: `${o.id}-b`, office: o, reason: "Δεν ανήκει σε κτίριο", icon: <Building2 className="size-4" /> });
    }
    return out;
  }, [offices]);

  return (
    <AdminPage
      title={`${greeting()}, ${user?.name.split(" ")[0] ?? ""}`}
      description={
        res.status === "ok" ? (
          <span className="nums">
            {offices.length} χώροι σε {buildings.length} κτίρια · {published} δημοσιευμένοι
            {offices.length - published ? `, ${offices.length - published} πρόχειροι` : ""}
          </span>
        ) : (
          " "
        )
      }
      actions={
        <>
          <ButtonLink to="/admin/plaques" icon={<QrCode className="size-4" />}>
            Πινακίδες QR
          </ButtonLink>
          {can("edit") ? (
            <ButtonLink to="/admin/spaces/new" variant="primary" icon={<Plus className="size-4" />}>
              Νέος χώρος
            </ButtonLink>
          ) : null}
        </>
      }
    >
      {res.status === "error" ? <ErrorNotice message={res.error.message} onRetry={res.reload} /> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {!can("edit") ? (
          <ViewerStart buildings={buildings.map((b) => ({ id: b.id, code: b.code, name: b.el.name, count: offices.filter((o) => o.buildingId === b.id && o.published).length }))} loading={res.status === "loading"} />
        ) : (
        <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)]" aria-labelledby="attn-h">
          <header className="flex items-baseline justify-between gap-3 border-b border-line/80 px-5 py-4">
            <h2 id="attn-h" className="text-base font-semibold">
              Χρειάζονται προσοχή
            </h2>
            {res.status === "ok" ? <span className="nums text-[0.8125rem] font-semibold text-muted">{issues.length}</span> : null}
          </header>
          {res.status === "loading" ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-8 text-[0.9375rem] text-muted">
              <CircleCheck className="size-5 text-ok" />
              Όλοι οι χώροι είναι δημοσιευμένοι, με στοιχεία επικοινωνίας και στις δύο γλώσσες.
            </div>
          ) : (
            <ul className="max-h-[32rem] divide-y divide-line/70 overflow-y-auto">
              {issues.map((i) => {
                const { headline } = officeHeadline(i.office, "el");
                const body = (
                  <>
                    <span className="font-display nums w-14 shrink-0 text-lg font-medium text-stone-ink">{i.office.code || "—"}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{headline}</span>
                      <span className="flex items-center gap-1.5 text-[0.8125rem] text-muted">
                        {i.icon}
                        {i.reason}
                      </span>
                    </span>
                    {can("edit") ? <ArrowRight className="size-4 shrink-0 text-line-strong group-hover:text-sea" aria-hidden /> : null}
                  </>
                );
                return (
                  <li key={i.key}>
                    {can("edit") ? (
                      <Link to={`/admin/spaces/${i.office.id}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-paper/70">
                        {body}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-5 py-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        )}

        <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)]" aria-labelledby="act-h">
          <header className="border-b border-line/80 px-5 py-4">
            <h2 id="act-h" className="text-base font-semibold">
              Πρόσφατες αλλαγές
            </h2>
          </header>
          {res.status === "loading" ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : activity.length === 0 ? (
            <p className="px-5 py-8 text-[0.9375rem] text-muted">Καμία αλλαγή ακόμη. Κάθε αποθήκευση καταγράφεται εδώ, με το ποιος την έκανε.</p>
          ) : (
            <ol className="relative px-5 py-4">
              {activity.map((a, idx) => (
                <ActivityItem key={a.id} a={a} last={idx === activity.length - 1} />
              ))}
            </ol>
          )}
        </section>
      </div>
    </AdminPage>
  );
}

const ACTION_ICON: Record<Activity["action"], ReactNode> = {
  create: <Plus className="size-3.5" />,
  update: <Pencil className="size-3.5" />,
  delete: <Trash2 className="size-3.5" />,
};

function ActivityItem({ a, last }: { a: Activity; last: boolean }) {
  const entityIcon = a.entity === "user" ? <UserRound className="size-3.5" /> : a.entity === "building" ? <Building2 className="size-3.5" /> : <DoorOpen className="size-3.5" />;
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!last ? <span className="absolute left-[13px] top-7 bottom-0 w-px bg-line" aria-hidden /> : null}
      <span
        className={cx(
          "relative grid size-[27px] shrink-0 place-items-center rounded-full",
          a.action === "delete" ? "bg-danger-bg text-danger" : a.action === "create" ? "bg-ok-bg text-ok" : "bg-paper-2 text-sea",
        )}
        title={a.entity}
      >
        {ACTION_ICON[a.action]}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[0.875rem] leading-snug text-ink">
          <span className="font-semibold">{a.userName ?? "Διαγραμμένος χρήστης"}</span> {a.summary.charAt(0).toLowerCase() + a.summary.slice(1)}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-muted">
          {entityIcon}
          {relativeTime(a.createdAt)}
        </p>
      </div>
    </li>
  );
}

/** View-only start: the job is finding and downloading plaques. */
function ViewerStart({ buildings, loading }: { buildings: { id: string; code: string; name: string; count: number }[]; loading: boolean }) {
  return (
    <section className="overflow-hidden rounded-xl bg-sea text-white shadow-[var(--shadow-card)]" aria-labelledby="viewer-h">
      <div className="p-6">
        <h2 id="viewer-h" className="font-display text-2xl font-semibold">
          Πινακίδες για εκτύπωση
        </h2>
        <p className="mt-1 max-w-md text-[0.9375rem] text-white/90">
          Βρείτε έναν χώρο και κατεβάστε την πινακίδα του σε PNG, ή όλες μαζί ανά κτίριο. Ο λογαριασμός σας είναι μόνο για προβολή.
        </p>
        <div className="my-5 h-px bg-stone/60" aria-hidden />
        {loading ? (
          <div className="h-20" />
        ) : (
          <ul className="divide-y divide-stone/30">
            {buildings.map((b) => (
              <li key={b.id}>
                <Link to="/admin/plaques" className="group -mx-2 flex items-center gap-4 rounded-md px-2 py-3.5 transition-colors hover:bg-white/[0.05]">
                  <span className="font-display nums text-4xl font-medium leading-none text-stone-soft">{b.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{b.name}</span>
                    <span className="nums text-[0.8125rem] text-white/90">{b.count} πινακίδες</span>
                  </span>
                  <ArrowRight className="size-4 text-white/50 group-hover:text-stone-soft" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="h-1.5 bg-stone" aria-hidden />
    </section>
  );
}
