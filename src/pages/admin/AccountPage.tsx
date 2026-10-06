import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/auth/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Button, Field, TextInput, useToast } from "@/components/ui";
import { FormSection } from "@/components/admin/EditorKit";
import { AdminPage, ROLE_LABEL } from "./AdminLayout";

export default function AccountPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);

  useEffect(() => {
    document.title = "Ο λογαριασμός μου · Διαχείριση";
  }, []);
  if (!user) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== repeat) return setError({ field: "repeat", message: "Οι δύο κωδικοί δεν ταιριάζουν." });
    setBusy(true);
    try {
      await api.changePassword(current, next);
      setCurrent("");
      setNext("");
      setRepeat("");
      toast("ok", "Ο κωδικός άλλαξε");
    } catch (ex) {
      setError(ex instanceof ApiError ? { field: ex.field, message: ex.message } : { message: String(ex) });
    } finally {
      setBusy(false);
    }
  }
  const err = (f: string) => (error?.field === f ? error.message : null);

  return (
    <AdminPage title="Ο λογαριασμός μου">
      <div className="max-w-2xl space-y-6">
        <FormSection title="Στοιχεία">
          <dl className="grid gap-4 text-[0.9375rem] sm:grid-cols-3">
            <div>
              <dt className="text-[0.8125rem] font-semibold text-muted">Όνομα</dt>
              <dd className="font-semibold">{user.name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[0.8125rem] font-semibold text-muted">Email</dt>
              <dd className="truncate font-semibold">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[0.8125rem] font-semibold text-muted">Ρόλος</dt>
              <dd className="font-semibold">{ROLE_LABEL[user.role]}</dd>
            </div>
          </dl>
          {user.role === "user" ? (
            <p className="text-[0.875rem] text-muted">Έχετε πρόσβαση προβολής: βλέπετε και κατεβάζετε πινακίδες. Για αλλαγές στο περιεχόμενο, απευθυνθείτε σε διαχειριστή.</p>
          ) : null}
        </FormSection>

        <form onSubmit={submit}>
          <FormSection title="Αλλαγή κωδικού">
            {error && !error.field ? <p className="text-sm font-medium text-danger">{error.message}</p> : null}
            <Field label="Τρέχων κωδικός" error={err("current")}>
              {(p) => <TextInput {...p} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Νέος κωδικός" error={err("next")} hint="Τουλάχιστον 8 χαρακτήρες">
                {(p) => <TextInput {...p} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />}
              </Field>
              <Field label="Επανάληψη" error={err("repeat")}>
                {(p) => <TextInput {...p} type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} required />}
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={busy} disabled={!current || !next || !repeat}>
                Αλλαγή κωδικού
              </Button>
            </div>
          </FormSection>
        </form>
      </div>
    </AdminPage>
  );
}
