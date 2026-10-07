import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, ExternalLink, TriangleAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { absoluteUrl, buildingPath, buildingSlug, relativeTime } from "@/lib/office";
import { emptyBuilding, type Building } from "@/lib/types";
import { BilingualField, FormSection, SaveBar, useUnsavedGuard } from "@/components/admin/EditorKit";
import { Button, ConfirmButton, ErrorNotice, Field, Skeleton, StatusDot, Switch, TextArea, TextInput, useToast } from "@/components/ui";
import { AdminPage } from "./AdminLayout";

export default function BuildingEditorPage() {
  const { id = "new" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const toast = useToast();
  const [saved, setSaved] = useState<Building | null>(null);
  const [draft, setDraft] = useState<Building | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    (isNew ? Promise.resolve(emptyBuilding()) : api.building(id)).then(
      (b) => {
        if (!alive) return;
        setSaved(b);
        setDraft(b);
      },
      (e: ApiError) => alive && setLoadError(e),
    );
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const dirty = useMemo(() => !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const allowLeave = useUnsavedGuard(dirty && !saving);
  useEffect(() => {
    document.title = `${isNew ? "Νέο κτίριο" : draft?.el.name || "Κτίριο"} · Διαχείριση`;
  }, [draft?.el.name, isNew]);

  if (loadError) {
    return (
      <AdminPage title="Κτίριο" back={<BackLink />}>
        <ErrorNotice message={loadError.message} />
      </AdminPage>
    );
  }
  if (!draft || !saved) {
    return (
      <AdminPage title={<Skeleton className="h-10 w-64" />} back={<BackLink />}>
        <Skeleton className="h-96 rounded-xl" />
      </AdminPage>
    );
  }

  const set = (patch: Partial<Building>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const setLoc = (lang: "el" | "en", key: keyof Omit<Building["el"], "departments">, value: string) =>
    setDraft((d) => (d ? { ...d, [lang]: { ...d[lang], [key]: value } } : d));
  const err = (field: string) => (fieldError?.field === field ? fieldError.message : null);
  const codeChanged = !isNew && saved.published && draft.code.trim() !== saved.code.trim();

  async function save() {
    if (!draft) return;
    setSaving(true);
    setFieldError(null);
    try {
      const out = isNew ? await api.createBuilding(draft) : await api.updateBuilding(draft);
      setSaved(out);
      setDraft(out);
      toast("ok", isNew ? "Το κτίριο δημιουργήθηκε" : "Οι αλλαγές αποθηκεύτηκαν");
      if (isNew) {
        allowLeave();
        navigate(`/admin/buildings/${out.id}`, { replace: true });
      }
    } catch (e) {
      const ae = e instanceof ApiError ? e : new ApiError(String(e), 0);
      setFieldError({ field: ae.field, message: ae.message });
      if (!ae.field) toast("err", ae.message);
    } finally {
      setSaving(false);
    }
  }

  const deps = (lang: "el" | "en") => draft[lang].departments.join("\n");
  const setDeps = (lang: "el" | "en", text: string) =>
    setDraft((d) => (d ? { ...d, [lang]: { ...d[lang], departments: text.split("\n") } } : d));

  return (
    <AdminPage
      back={<BackLink />}
      title={isNew ? "Νέο κτίριο" : draft.el.name || "Χωρίς όνομα"}
      description={
        isNew ? undefined : (
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusDot published={saved.published} />
            <span>Τελευταία αλλαγή {relativeTime(saved.updatedAt)}{saved.updatedBy ? ` από ${saved.updatedBy}` : ""}</span>
          </span>
        )
      }
      actions={
        !isNew ? (
          <a href={absoluteUrl(buildingPath(saved))} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-sea hover:bg-sea/[0.06]">
            <ExternalLink className="size-4" />
            Δημόσια σελίδα
          </a>
        ) : null
      }
    >
      <div className="max-w-4xl space-y-6">
        {fieldError?.field ? <ErrorNotice message={fieldError.message} /> : null}

        <FormSection title="Ταυτότητα">
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <Field label="Κωδικός" error={err("code")} hint={<span className="nums">/b/{draft.code || "…"}</span>}>
              {(p) => <TextInput {...p} value={draft.code} onChange={(e) => set({ code: e.target.value })} className="nums font-display text-lg" placeholder="1" />}
            </Field>
            <div className="sm:pt-7">
              <Switch checked={draft.published} onChange={(published) => set({ published })} label="Δημοσιευμένο" description="Ορατό στον δημόσιο κατάλογο." />
            </div>
          </div>
          {codeChanged ? (
            <div role="alert" className="flex gap-3 rounded-lg bg-warn-bg px-4 py-3 text-sm text-warn">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                <strong className="font-semibold">Αλλάζει το μόνιμο URL</strong> από <span className="nums font-semibold">/b/{buildingSlug(saved)}</span>. Οι υπάρχοντες σύνδεσμοι θα σταματήσουν να λειτουργούν.
              </p>
            </div>
          ) : null}
          <BilingualField label="Όνομα κτιρίου" el={draft.el.name} en={draft.en.name} error={err("el.name")} onChange={(l, v) => setLoc(l, "name", v)} />
          <BilingualField label="Νησί" el={draft.el.island} en={draft.en.island} onChange={(l, v) => setLoc(l, "island", v)} />
          <BilingualField label="Σχολή" el={draft.el.school} en={draft.en.school} onChange={(l, v) => setLoc(l, "school", v)} />
          <BilingualField label="Περιγραφή" multiline el={draft.el.notes} en={draft.en.notes} onChange={(l, v) => setLoc(l, "notes", v)} />
          <fieldset className="grid gap-3 md:grid-cols-2">
            <legend className="sr-only">Τμήματα</legend>
            <Field label="Τμήματα" lang="ΕΛ" hint="Ένα ανά γραμμή">
              {(p) => <TextArea {...p} value={deps("el")} onChange={(e) => setDeps("el", e.target.value)} />}
            </Field>
            <Field label={<span className="md:sr-only">Τμήματα</span>} lang="EN">
              {(p) => <TextArea {...p} value={deps("en")} onChange={(e) => setDeps("en", e.target.value)} />}
            </Field>
          </fieldset>
        </FormSection>

        <FormSection title="Τοποθεσία & επικοινωνία">
          <BilingualField label="Διεύθυνση" el={draft.el.address} en={draft.en.address} onChange={(l, v) => setLoc(l, "address", v)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Γεωγρ. πλάτος" error={err("lat")} hint="π.χ. 39.0845">
              {(p) => <CoordInput {...p} value={draft.lat} onValue={(lat) => set({ lat })} />}
            </Field>
            <Field label="Γεωγρ. μήκος" error={err("lng")} hint="π.χ. 26.5672">
              {(p) => <CoordInput {...p} value={draft.lng} onValue={(lng) => set({ lng })} />}
            </Field>
            <Field label="Τηλέφωνο γραμματείας" error={err("phone")}>
              {(p) => <TextInput {...p} type="tel" className="nums" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />}
            </Field>
            <Field label="Email" error={err("email")}>
              {(p) => <TextInput {...p} type="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} />}
            </Field>
            <Field label="Ιστοσελίδα" error={err("website")} className="sm:col-span-2">
              {(p) => <TextInput {...p} type="url" value={draft.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://" />}
            </Field>
          </div>
        </FormSection>

        {!isNew ? (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-danger/20 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Διαγραφή κτιρίου</h2>
              <p className="text-[0.8125rem] text-muted">Οι χώροι του δεν διαγράφονται.</p>
            </div>
            <ConfirmButton
              onConfirm={async () => {
                try {
                  await api.deleteBuilding(saved.id);
                  allowLeave();
                  toast("ok", "Το κτίριο διαγράφηκε");
                  navigate("/admin/buildings", { replace: true });
                } catch (e) {
                  toast("err", e instanceof ApiError ? e.message : "Η διαγραφή απέτυχε");
                }
              }}
            >
              Διαγραφή
            </ConfirmButton>
          </section>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setDraft(saved)} disabled={!dirty || saving}>
            Αναίρεση αλλαγών
          </Button>
          <Button variant="primary" onClick={save} loading={saving} disabled={!dirty && !isNew}>
            {isNew ? "Δημιουργία κτιρίου" : "Αποθήκευση"}
          </Button>
        </div>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setDraft(saved)} />
    </AdminPage>
  );
}

function BackLink() {
  return (
    <Link to="/admin/buildings" className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-muted hover:text-sea">
      <ArrowLeft className="size-4" />
      Κτίρια
    </Link>
  );
}

/** Keeps the typed text (so "39." survives) and reports a number or null upward. */
function CoordInput({ value, onValue, ...p }: { value: number | null; onValue: (v: number | null) => void; id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) {
  const [text, setText] = useState(value == null ? "" : String(value));
  const parsed = text.trim() === "" ? null : Number(text.replace(",", "."));
  useEffect(() => {
    if (parsed !== value && !(Number.isNaN(parsed) && value == null)) setText(value == null ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const invalid = parsed !== null && Number.isNaN(parsed);
  return (
    <TextInput
      {...p}
      inputMode="decimal"
      className="nums"
      value={text}
      aria-invalid={invalid || p["aria-invalid"] || undefined}
      onChange={(e) => {
        setText(e.target.value);
        const v = e.target.value.trim() === "" ? null : Number(e.target.value.replace(",", "."));
        if (v === null || !Number.isNaN(v)) onValue(v);
      }}
    />
  );
}
