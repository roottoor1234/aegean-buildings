import { useEffect, useState, type FormEvent } from "react";
import { Plus, ShieldCheck, Eye, UserRound } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Role } from "@/lib/types";
import { relativeTime } from "@/lib/office";
import { useAsync } from "@/lib/useAsync";
import { Badge, Button, ConfirmButton, ErrorNotice, Field, Select, Skeleton, Switch, TextInput, cx, useToast } from "@/components/ui";
import { AdminPage, ROLE_LABEL } from "./AdminLayout";

const ROLE_HELP: Record<Role, string> = {
  admin: "Επεξεργάζεται χώρους, κτίρια και χρήστες.",
  user: "Βλέπει τις πινακίδες και τις κατεβάζει. Δεν αλλάζει τίποτα.",
};

type Draft = { name: string; email: string; role: Role; active: boolean; password: string };
const blank: Draft = { name: "", email: "", role: "user", active: true, password: "" };

export default function UsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const res = useAsync(() => api.users(), []);
  const [editing, setEditing] = useState<number | "new" | null>(null);

  useEffect(() => {
    document.title = "Χρήστες · Διαχείριση";
  }, []);

  const users = res.data ?? [];
  const admins = users.filter((u) => u.role === "admin" && u.active).length;

  return (
    <AdminPage
      title="Χρήστες"
      description="Δύο ρόλοι: ο διαχειριστής αλλάζει περιεχόμενο, ο χρήστης προβολής μόνο βλέπει και κατεβάζει πινακίδες."
      actions={
        editing !== "new" ? (
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setEditing("new")}>
            Νέος χρήστης
          </Button>
        ) : null
      }
    >
      {res.status === "error" ? <ErrorNotice message={res.error.message} onRetry={res.reload} /> : null}

      {editing === "new" ? (
        <div className="mb-6">
          <UserForm
            initial={blank}
            creating
            onCancel={() => setEditing(null)}
            onSubmit={async (d) => {
              const u = await api.createUser(d);
              res.set((list) => [...list, u]);
              setEditing(null);
              toast("ok", `Ο λογαριασμός για ${u.name} δημιουργήθηκε. Στείλτε του τον κωδικό με ασφαλή τρόπο.`);
            }}
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[var(--shadow-card)]">
        {res.status === "loading" ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <ul className="divide-y divide-line/80">
            {users.map((u) => {
              const self = u.id === me?.id;
              const open = editing === u.id;
              return (
                <li key={u.id} className={cx(open && "bg-paper/60")}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                    <span className={cx("grid size-10 shrink-0 place-items-center rounded-full", u.role === "admin" ? "bg-sea text-stone-soft" : "bg-paper-2 text-sea")}>
                      {u.role === "admin" ? <ShieldCheck className="size-[18px]" /> : <Eye className="size-[18px]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                        {u.name}
                        {self ? <Badge tone="stone">εσείς</Badge> : null}
                        {!u.active ? <Badge tone="danger">ανενεργός</Badge> : null}
                      </p>
                      <p className="truncate text-[0.875rem] text-muted">{u.email}</p>
                    </div>
                    <div className="hidden min-w-[9rem] text-[0.8125rem] sm:block">
                      <p className="font-semibold text-ink/85">{ROLE_LABEL[u.role]}</p>
                      <p className="text-muted">{u.lastLoginAt ? `σύνδεση ${relativeTime(u.lastLoginAt)}` : "δεν έχει συνδεθεί"}</p>
                    </div>
                    <Button size="sm" variant={open ? "ghost" : "secondary"} onClick={() => setEditing(open ? null : u.id)}>
                      {open ? "Κλείσιμο" : "Επεξεργασία"}
                    </Button>
                  </div>
                  {open ? (
                    <div className="px-5 pb-5">
                      <UserForm
                        initial={{ name: u.name, email: u.email, role: u.role, active: u.active, password: "" }}
                        self={self}
                        lastAdmin={u.role === "admin" && u.active && admins <= 1}
                        onCancel={() => setEditing(null)}
                        onSubmit={async (d) => {
                          const out = await api.updateUser(u.id, d);
                          res.set((list) => list.map((x) => (x.id === u.id ? out : x)));
                          setEditing(null);
                          toast("ok", "Ο χρήστης ενημερώθηκε");
                        }}
                        onDelete={
                          self
                            ? undefined
                            : async () => {
                                await api.deleteUser(u.id);
                                res.set((list) => list.filter((x) => x.id !== u.id));
                                setEditing(null);
                                toast("ok", `Ο λογαριασμός ${u.name} διαγράφηκε`);
                              }
                        }
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}

function UserForm({
  initial,
  creating,
  self,
  lastAdmin,
  onSubmit,
  onCancel,
  onDelete,
}: {
  initial: Draft;
  creating?: boolean;
  self?: boolean;
  lastAdmin?: boolean;
  onSubmit: (d: Draft) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [d, setD] = useState<Draft>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const err = (f: string) => (error?.field === f ? error.message : null);
  const lockRole = self || lastAdmin;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(d);
    } catch (ex) {
      setError(ex instanceof ApiError ? { field: ex.field, message: ex.message } : { message: String(ex) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-card p-5 shadow-[var(--shadow-card)]">
      {creating ? (
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <UserRound className="size-4 text-sea" />
          Νέος χρήστης
        </h2>
      ) : null}
      {error && !error.field ? (
        <div className="mb-4">
          <ErrorNotice message={error.message} />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ονοματεπώνυμο" error={err("name")}>
          {(p) => <TextInput {...p} value={d.name} onChange={(e) => set({ name: e.target.value })} required autoFocus={creating} />}
        </Field>
        <Field label="Email (για σύνδεση)" error={err("email")}>
          {(p) => <TextInput {...p} type="email" value={d.email} onChange={(e) => set({ email: e.target.value })} required />}
        </Field>
        <Field label="Ρόλος" error={err("role")} hint={lockRole ? (self ? "Δεν αλλάζετε τον δικό σας ρόλο." : "Είναι ο μόνος ενεργός διαχειριστής.") : ROLE_HELP[d.role]}>
          {(p) => (
            <Select {...p} value={d.role} disabled={lockRole} onChange={(e) => set({ role: e.target.value as Role })}>
              <option value="user">{ROLE_LABEL.user}</option>
              <option value="admin">{ROLE_LABEL.admin}</option>
            </Select>
          )}
        </Field>
        <Field label={creating ? "Αρχικός κωδικός" : "Νέος κωδικός"} error={err("password")} hint={creating ? "Τουλάχιστον 8 χαρακτήρες" : "Αφήστε κενό για να μείνει ο ίδιος"}>
          {(p) => <TextInput {...p} type="text" autoComplete="new-password" value={d.password} onChange={(e) => set({ password: e.target.value })} required={creating} minLength={8} />}
        </Field>
      </div>
      {!creating ? (
        <div className="mt-5">
          <Switch
            checked={d.active}
            disabled={lockRole}
            onChange={(active) => set({ active })}
            label="Ενεργός λογαριασμός"
            description="Ένας ανενεργός χρήστης δεν μπορεί να συνδεθεί, αλλά το ιστορικό του μένει."
          />
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/80 pt-4">
        <div>{onDelete && !lastAdmin ? <ConfirmButton size="sm" onConfirm={onDelete}>Διαγραφή χρήστη</ConfirmButton> : null}</div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Άκυρο
          </Button>
          <Button type="submit" variant="primary" loading={busy}>
            {creating ? "Δημιουργία λογαριασμού" : "Αποθήκευση"}
          </Button>
        </div>
      </div>
    </form>
  );
}
