import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, ExternalLink, TriangleAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { absoluteUrl, officeHeadline, officePath, officeSlug, relativeTime, safeFilename } from "@/lib/office";
import { downloadPlaque, officePlaqueSpec } from "@/lib/plaque";
import { emptyOffice, type Building, type Office, type OfficeKind } from "@/lib/types";
import { BilingualField, FormSection, SaveBar, useUnsavedGuard } from "@/components/admin/EditorKit";
import { PlaquePreview } from "@/components/admin/PlaquePreview";
import { Plate } from "@/components/public/Plate";
import { Button, ConfirmButton, ErrorNotice, Field, Segmented, Select, Skeleton, StatusDot, Switch, TextInput, useToast } from "@/components/ui";
import { AdminPage } from "./AdminLayout";
import { KIND_LABEL } from "./SpacesPage";

export default function SpaceEditorPage() {
  const { id = "new" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const toast = useToast();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [saved, setSaved] = useState<Office | null>(null);
  const [draft, setDraft] = useState<Office | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadError(null);
    Promise.all([isNew ? Promise.resolve(null) : api.office(id), api.buildings()]).then(
      ([office, bs]) => {
        if (!alive) return;
        setBuildings(bs);
        const start = office ?? { ...emptyOffice(), buildingId: bs[0]?.id ?? null };
        setSaved(start);
        setDraft(start);
      },
      (e: ApiError) => alive && setLoadError(e),
    );
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const dirty = useMemo(() => !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const allowLeave = useUnsavedGuard(dirty && !saving);

  const { headline, sub } = draft ? officeHeadline(draft, "el") : { headline: "", sub: "" };
  useEffect(() => {
    document.title = `${isNew ? "Νέος χώρος" : headline || "Χώρος"} · Διαχείριση`;
  }, [headline, isNew]);

  if (loadError) {
    return (
      <AdminPage title="Χώρος" back={<BackLink />}>
        <ErrorNotice message={loadError.message} />
      </AdminPage>
    );
  }
  if (!draft || !saved) {
    return (
      <AdminPage title={<Skeleton className="h-10 w-64" />} back={<BackLink />}>
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </AdminPage>
    );
  }

  const set = (patch: Partial<Office>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const setLoc = (lang: "el" | "en", key: keyof Office["el"], value: string) =>
    setDraft((d) => (d ? { ...d, [lang]: { ...d[lang], [key]: value } } : d));
  const err = (field: string) => (fieldError?.field === field ? fieldError.message : null);

  const building = buildings.find((b) => b.id === draft.buildingId);
  const codeChanged = !isNew && saved.published && draft.code.trim() !== saved.code.trim();
  const url = absoluteUrl(officePath(draft.id ? draft : { ...draft, id: "…" }));
  const savedUrl = absoluteUrl(officePath(saved));

  async function save() {
    if (!draft) return;
    setSaving(true);
    setFieldError(null);
    try {
      const out = isNew ? await api.createOffice(draft) : await api.updateOffice(draft);
      setSaved(out);
      setDraft(out);
      toast("ok", isNew ? "Ο χώρος δημιουργήθηκε" : "Οι αλλαγές αποθηκεύτηκαν");
      if (isNew) {
        allowLeave();
        navigate(`/admin/spaces/${out.id}`, { replace: true });
      }
    } catch (e) {
      const ae = e instanceof ApiError ? e : new ApiError(String(e), 0);
      setFieldError({ field: ae.field, message: ae.message });
      if (!ae.field) toast("err", ae.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api.deleteOffice(saved!.id);
      allowLeave();
      toast("ok", "Ο χώρος διαγράφηκε");
      navigate("/admin/spaces", { replace: true });
    } catch (e) {
      toast("err", e instanceof ApiError ? e.message : "Η διαγραφή απέτυχε");
    }
  }

  return (
    <AdminPage
      back={<BackLink />}
      title={isNew ? "Νέος χώρος" : headline || "Χωρίς όνομα"}
      description={
        isNew ? (
          undefined
        ) : (
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusDot published={saved.published} />
            {saved.updatedAt ? (
              <span>
                Τελευταία αλλαγή {relativeTime(saved.updatedAt)}
                {saved.updatedBy ? ` από ${saved.updatedBy}` : ""}
              </span>
            ) : null}
          </span>
        )
      }
      actions={
        !isNew ? (
          <a href={savedUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-sea hover:bg-sea/[0.06]">
            <ExternalLink className="size-4" />
            Δημόσια σελίδα
          </a>
        ) : null
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {fieldError && fieldError.field ? <ErrorNotice message={fieldError.message} /> : null}

          <FormSection title="Στοιχεία χώρου">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <Field label="Αρίθμηση" error={err("code")} hint={!err("code") ? <span className="nums break-all">{url.replace(/^https?:\/\//, "")}</span> : undefined}>
                {(p) => (
                  <TextInput {...p} value={draft.code} onChange={(e) => set({ code: e.target.value })} placeholder="1.1.1" className="nums font-display text-lg" autoFocus={isNew} />
                )}
              </Field>
              <Field label="Κτίριο" error={err("buildingId")}>
                {(p) => (
                  <Select {...p} value={draft.buildingId ?? ""} onChange={(e) => set({ buildingId: e.target.value || null })}>
                    <option value="">Χωρίς κτίριο</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code ? `${b.code} · ` : ""}
                        {b.el.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            {codeChanged ? (
              <div role="alert" className="flex gap-3 rounded-lg bg-warn-bg px-4 py-3 text-sm text-warn">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>
                  <strong className="font-semibold">Αλλάζει το μόνιμο URL.</strong> Οι ήδη τυπωμένες πινακίδες δείχνουν στο{" "}
                  <span className="nums font-semibold">/o/{officeSlug(saved)}</span> και θα σταματήσουν να λειτουργούν. Τυπώστε νέα πινακίδα μετά την αποθήκευση.
                </p>
              </div>
            ) : null}
            <div>
              <p className="mb-1.5 text-[0.8125rem] font-semibold text-ink/80">Είδος</p>
              <Segmented<OfficeKind>
                label="Είδος χώρου"
                value={draft.kind}
                onChange={(kind) => set({ kind })}
                options={(Object.keys(KIND_LABEL) as OfficeKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))}
              />
            </div>
            <Switch
              checked={draft.published}
              onChange={(published) => set({ published })}
              label="Δημοσιευμένο"
              description={draft.published ? "Η σελίδα είναι δημόσια." : "Η σελίδα δεν είναι δημόσια."}
            />
          </FormSection>

          <FormSection title="Περιεχόμενο">
            <BilingualField
              label="Ονοματεπώνυμο"
              hint="Για εργαστήρια και αίθουσες αφήνεται κενό."
              el={draft.el.occupant}
              en={draft.en.occupant}
              onChange={(l, v) => setLoc(l, "occupant", v)}
              placeholder={{ el: "π.χ. Παπαδόπουλος Γιώργος", en: "e.g. George Papadopoulos" }}
            />
            <BilingualField
              label="Ιδιότητα / Ονομασία χώρου"
              el={draft.el.title}
              en={draft.en.title}
              onChange={(l, v) => setLoc(l, "title", v)}
              placeholder={{ el: "π.χ. Αναπληρωτής Καθηγητής", en: "e.g. Associate Professor" }}
            />
            <BilingualField
              label="Ετικέτα"
              hint="Εμφανίζεται όταν δεν υπάρχει ονοματεπώνυμο."
              el={draft.el.label}
              en={draft.en.label}
              error={err("el.label")}
              onChange={(l, v) => setLoc(l, "label", v)}
              placeholder={{ el: "π.χ. Γραφείο 1.1.1", en: "e.g. Office 1.1.1" }}
            />
            <BilingualField label="Τμήμα" el={draft.el.department} en={draft.en.department} onChange={(l, v) => setLoc(l, "department", v)} />
            <BilingualField
              label="Πληροφορίες"
              hint="π.χ. ώρες υποδοχής φοιτητών."
              multiline
              el={draft.el.notes}
              en={draft.en.notes}
              onChange={(l, v) => setLoc(l, "notes", v)}
            />
          </FormSection>

          <FormSection title="Επικοινωνία">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Τηλέφωνο" error={err("phone")}>
                {(p) => <TextInput {...p} type="tel" inputMode="tel" className="nums" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="22510 36600" />}
              </Field>
              <Field label="Email" error={err("email")}>
                {(p) => <TextInput {...p} type="email" inputMode="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} placeholder="onoma@aegean.gr" />}
              </Field>
            </div>
          </FormSection>

          {!isNew ? (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-danger/20 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-ink">Διαγραφή χώρου</h2>
                <p className="text-[0.8125rem] text-muted">Η ενέργεια δεν αναιρείται. Για προσωρινή απόσυρση, καταργήστε τη δημοσίευση.</p>
              </div>
              <ConfirmButton onConfirm={remove}>Διαγραφή</ConfirmButton>
            </section>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDraft(saved)} disabled={!dirty || saving}>
              Αναίρεση αλλαγών
            </Button>
            <Button variant="primary" onClick={save} loading={saving} disabled={!dirty && !isNew}>
              {isNew ? "Δημιουργία χώρου" : "Αποθήκευση"}
            </Button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6" aria-label="Προεπισκόπηση">
          <div>
            <p className="mb-2 text-[0.8125rem] font-semibold text-muted">Προεπισκόπηση</p>
            <div className="overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
              <Plate
                compact
                animate={false}
                numeral={draft.code || undefined}
                meta={
                  <>
                    {KIND_LABEL[draft.kind]}
                    {building ? <span className="block text-white/90">Κτίριο {building.code}</span> : null}
                  </>
                }
                title={headline || "Χωρίς όνομα"}
                subtitle={sub}
              />
              <div className="space-y-2 bg-paper p-3">
                {draft.phone ? <div className="nums rounded-lg bg-sea px-3 py-2 text-sm font-semibold text-white">Κλήση · {draft.phone}</div> : null}
                {draft.email ? <div className="truncate rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold text-sea">{draft.email}</div> : null}
                {!draft.phone && !draft.email ? <p className="px-1 text-[0.8125rem] text-muted">Χωρίς στοιχεία επικοινωνίας</p> : null}
              </div>
            </div>
          </div>
          {!isNew ? (
            <div>
              <p className="mb-2 text-[0.8125rem] font-semibold text-muted">Πινακίδα</p>
              <PlaquePreview spec={officePlaqueSpec(saved, buildings.find((b) => b.id === saved.buildingId)?.code, savedUrl)} />
              <Button
                className="mt-3 w-full"
                icon={<Download className="size-4" />}
                onClick={() => {
                  const spec = officePlaqueSpec(saved, buildings.find((b) => b.id === saved.buildingId)?.code, savedUrl);
                  downloadPlaque(spec, `QR_${safeFilename(saved.code || spec.title)}.png`).catch(() => toast("err", "Η λήψη απέτυχε"));
                }}
              >
                Λήψη PNG
              </Button>
              {dirty ? <p className="mt-2 text-[0.8125rem] text-muted">Ενημερώνεται μετά την αποθήκευση.</p> : null}
            </div>
          ) : null}
        </aside>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setDraft(saved)} label={isNew ? "Δημιουργία" : "Αποθήκευση"} />
    </AdminPage>
  );
}

function BackLink() {
  return (
    <Link to="/admin/spaces" className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-muted hover:text-sea">
      <ArrowLeft className="size-4" />
      Χώροι
    </Link>
  );
}
