"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lang, Office, LocalizedOffice } from "@/lib/types";
import { createEmptyOffice } from "@/lib/types";
import { newBuildingId } from "@/lib/ids";
import { officeSlug } from "@/lib/paths";
import { officeMatchesQuery } from "@/lib/office-search";
import { PageLoader, Spinner } from "@/components/Spinner";

export function AdminClient() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editLang, setEditLang] = useState<Lang>("el");
  const [origin, setOrigin] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    // Google Translate mutates the DOM and breaks React updates on admin.
    document.documentElement.classList.add("notranslate");
    document.body?.classList.add("notranslate");
    document.cookie = "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    (async () => {
      try {
        const res = await fetch("/api/offices", { cache: "no-store" });
        const data = (await res.json()) as Office[];
        setOffices(data);
        setSelectedId(data[0]?.id ?? null);
      } catch {
        setToast({ type: "err", message: "Αποτυχία φόρτωσης δεδομένων" });
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      document.documentElement.classList.remove("notranslate");
      document.body?.classList.remove("notranslate");
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const list = useMemo(() => {
    const byBuilding =
      filter === "all" ? offices : offices.filter((o) => o.buildingCode === filter);
    return byBuilding.filter((o) => officeMatchesQuery(o, query));
  }, [offices, filter, query]);
  const selected = offices.find((b) => b.id === selectedId) || null;

  async function save() {
    if (saving) return;
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/offices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offices),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Αποτυχία αποθήκευσης";
        setStatus(msg);
        setToast({ type: "err", message: msg });
        return;
      }
      const msg = `Αποθηκεύτηκαν ${data.count} χώροι`;
      setStatus(msg);
      setToast({ type: "ok", message: msg });
    } catch {
      const msg = "Σφάλμα δικτύου — δοκίμασε ξανά";
      setStatus(msg);
      setToast({ type: "err", message: msg });
    } finally {
      setSaving(false);
    }
  }

  function updateSelected(patch: Partial<Office>) {
    if (!selected) return;
    setOffices((prev) => prev.map((b) => (b.id === selected.id ? { ...b, ...patch } : b)));
  }

  function updateLocalized(patch: Partial<LocalizedOffice>) {
    if (!selected) return;
    updateSelected({ [editLang]: { ...selected[editLang], ...patch } });
  }

  if (loading) return <PageLoader label="Φόρτωση διαχείρισης…" />;

  return (
    <div className="notranslate min-h-screen" translate="no">
      <header className="border-b border-line bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Admin · Σήμανση γραφείων ΤΠΤΕ</h1>
            <p className="text-sm text-white/75">Επεξεργασία χωρίς αλλαγή QR — μόνιμα URL /o/1.1.1</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold">
              Αρχική
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-[#1a1404] disabled:opacity-60"
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center ${
                  saving ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-hidden={!saving}
              >
                <Spinner size="sm" layout="inline" />
              </span>
              <span>{saving ? "Αποθήκευση…" : "Αποθήκευση"}</span>
            </button>
          </div>
        </div>
      </header>

      {toast ? (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "ok"
              ? "bg-emerald-700 text-white"
              : "bg-red-700 text-white"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-line bg-card p-4 h-fit max-h-[80vh] overflow-auto">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Χώροι</h2>
            <button
              type="button"
              className="text-sm font-semibold text-navy"
              onClick={() => {
                const o = createEmptyOffice(newBuildingId());
                o.el.label = "Νέο γραφείο";
                o.en.label = "New office";
                o.el.department = "Τμήμα Πολιτισμικής Τεχνολογίας και Επικοινωνίας";
                o.en.department = "Department of Cultural Technology and Communication";
                setOffices((prev) => [...prev, o]);
                setSelectedId(o.id);
              }}
            >
              + Νέο
            </button>
          </div>
          <div className="mb-3 inline-flex overflow-hidden rounded-lg border border-line text-xs font-semibold">
            {["all", "1", "2"].map((f) => (
              <button key={f} type="button" className={`px-2 py-1 ${filter === f ? "bg-navy text-white" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "Όλα" : `Κτ. ${f}`}
              </button>
            ))}
          </div>
          <label className="mb-3 block">
            <span className="sr-only">Αναζήτηση</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Αναζήτηση ονόματος, κωδικού…"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none ring-navy/20 placeholder:text-muted focus:ring-2"
            />
          </label>
          <ul className="space-y-1">
            {list.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(o.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${o.id === selectedId ? "bg-navy text-white" : "hover:bg-[#efe8d6]"}`}
                >
                  <div className="font-semibold">{o.code || "—"} · {o.el.occupant || o.el.label}</div>
                  <div className={`text-xs ${o.id === selectedId ? "text-white/70" : "text-muted"}`}>/o/{officeSlug(o)}</div>
                </button>
              </li>
            ))}
          </ul>
          {list.length === 0 ? (
            <p className="mt-3 text-center text-xs text-muted">Κανένα αποτέλεσμα</p>
          ) : null}
          {status ? <p className="mt-4 text-xs text-muted">{status}</p> : null}
        </aside>

        {selected ? (
          <section className="rounded-2xl border border-line bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Permanent URL</p>
                <a className="text-navy underline break-all" href={`/o/${officeSlug(selected)}`} target="_blank" rel="noreferrer">
                  {origin}/o/{officeSlug(selected)}
                </a>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={selected.published} onChange={(e) => updateSelected({ published: e.target.checked })} />
                Δημοσιευμένο
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Αρίθμηση" value={selected.code} onChange={(v) => updateSelected({ code: v })} />
              <Field label="Κτίριο (1/2)" value={selected.buildingCode} onChange={(v) => updateSelected({ buildingCode: v })} />
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-muted">Είδος</span>
                <select
                  className="w-full rounded-xl border border-line bg-white px-3 py-2"
                  value={selected.kind}
                  onChange={(e) => updateSelected({ kind: e.target.value as Office["kind"] })}
                >
                  <option value="office">Γραφείο</option>
                  <option value="lab">Εργαστήριο</option>
                  <option value="room">Αίθουσα</option>
                </select>
              </label>
              <Field label="Τηλέφωνο" value={selected.phone || ""} onChange={(v) => updateSelected({ phone: v })} />
              <Field label="Email" value={selected.email || ""} onChange={(v) => updateSelected({ email: v })} />
            </div>

            <div className="inline-flex overflow-hidden rounded-xl border border-line text-sm font-semibold">
              <button type="button" className={`px-4 py-2 ${editLang === "el" ? "bg-navy text-white" : "bg-white"}`} onClick={() => setEditLang("el")}>Ελληνικά</button>
              <button type="button" className={`px-4 py-2 ${editLang === "en" ? "bg-navy text-white" : "bg-white"}`} onClick={() => setEditLang("en")}>English</button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ετικέτα / Label" value={selected[editLang].label} onChange={(v) => updateLocalized({ label: v })} />
              <Field label="Όνομα / Occupant" value={selected[editLang].occupant} onChange={(v) => updateLocalized({ occupant: v })} />
              <Field label="Ιδιότητα / Title" value={selected[editLang].title} onChange={(v) => updateLocalized({ title: v })} />
              <Field label="Κτίριο / Building" value={selected[editLang].building} onChange={(v) => updateLocalized({ building: v })} />
              <Field label="Τμήμα / Department" value={selected[editLang].department} onChange={(v) => updateLocalized({ department: v })} />
            </div>
            <Area label="Σημειώσεις" value={selected[editLang].notes || ""} onChange={(v) => updateLocalized({ notes: v })} />

            <button
              type="button"
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
              onClick={() => {
                if (!confirm("Διαγραφή;")) return;
                setOffices((prev) => prev.filter((b) => b.id !== selected.id));
                setSelectedId(null);
              }}
            >
              Διαγραφή
            </button>
          </section>
        ) : (
          <p className="text-muted">Επίλεξε ή δημιούργησε χώρο.</p>
        )}
      </main>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-muted">{label}</span>
      <input className="w-full rounded-xl border border-line bg-white px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-muted">{label}</span>
      <textarea className="w-full rounded-xl border border-line bg-white px-3 py-2 min-h-24" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
