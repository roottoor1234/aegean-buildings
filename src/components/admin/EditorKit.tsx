import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useBlocker } from "react-router";
import { Button, Field, TextArea, TextInput, cx } from "@/components/ui";

/** A titled block of the editor form. */
export function FormSection({ title, description, children, className }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-xl border border-line bg-card shadow-[var(--shadow-card)]", className)}>
      <header className="border-b border-line/80 px-5 py-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-[0.8125rem] text-muted">{description}</p> : null}
      </header>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

/** Greek and English side by side: bilingual is the default, not a tab. */
export function BilingualField({
  label,
  hint,
  el,
  en,
  onChange,
  multiline,
  error,
  placeholder,
}: {
  label: string;
  hint?: string;
  el: string;
  en: string;
  onChange: (lang: "el" | "en", value: string) => void;
  multiline?: boolean;
  error?: string | null;
  placeholder?: { el?: string; en?: string };
}) {
  const Input = multiline ? TextArea : TextInput;
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label={label} lang="ΕΛ" error={error} hint={hint}>
          {(p) => <Input {...p} lang="el" value={el} placeholder={placeholder?.el} onChange={(e) => onChange("el", e.target.value)} />}
        </Field>
        <Field label={<span className="md:sr-only">{label}</span>} lang="EN">
          {(p) => <Input {...p} lang="en" value={en} placeholder={placeholder?.en} onChange={(e) => onChange("en", e.target.value)} />}
        </Field>
      </div>
    </fieldset>
  );
}

/** Sticky save bar that appears only while there are unsaved changes. */
export function SaveBar({ dirty, saving, onSave, onDiscard, label = "Αποθήκευση" }: { dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void; label?: string }) {
  return (
    <div
      className={cx(
        "fixed inset-x-0 bottom-0 z-40 transition-[transform,opacity] duration-300 ease-[var(--ease-out-expo)] lg:left-64",
        dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
      aria-hidden={!dirty}
    >
      <div className="mx-auto mb-[max(1rem,env(safe-area-inset-bottom))] flex max-w-3xl items-center justify-between gap-3 rounded-xl bg-sea-deep px-4 py-3 text-white shadow-[var(--shadow-lift)] mx-4 sm:mx-auto">
        <p className="text-sm font-semibold">
          <span className="mr-2 inline-block size-2 rounded-full bg-stone-soft align-middle" aria-hidden />
          Μη αποθηκευμένες αλλαγές
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="onSea" onClick={onDiscard} disabled={saving} tabIndex={dirty ? 0 : -1}>
            Αναίρεση
          </Button>
          <Button size="sm" variant="primary" onClick={onSave} loading={saving} tabIndex={dirty ? 0 : -1}>
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Warn before leaving with unsaved edits: in-app navigation and tab close. */
export function useUnsavedGuard(dirty: boolean) {
  const bypass = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && !bypass.current && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (!dirty) bypass.current = false;
  }, [dirty]);
  useEffect(() => {
    if (blocker.state === "blocked") {
      if (window.confirm("Υπάρχουν μη αποθηκευμένες αλλαγές. Να φύγετε χωρίς αποθήκευση;")) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  /** Call before a programmatic navigate that follows a successful save/delete. */
  return useCallback(() => {
    bypass.current = true;
  }, []);
}
