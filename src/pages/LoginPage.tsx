import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/lib/api";
import { Button, ErrorNotice, Field, TextInput } from "@/components/ui";

const logo = `${import.meta.env.BASE_URL}assets/logo-aegean.png`;

export default function LoginPage() {
  const { user, ready, login, error: bootError } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = params.get("next");
  const target = next && next.startsWith("/admin") ? next : "/admin";

  useEffect(() => {
    document.title = "Είσοδος · Ψηφιακή Σήμανση ΤΠΤΕ";
  }, []);

  if (ready && user) return <Navigate to={target} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Η σύνδεση απέτυχε.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="on-sea relative flex min-h-dvh flex-col bg-sea-deep text-white">
      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <img src={logo} alt="Πανεπιστήμιο Αιγαίου" width={228} height={83} className="h-10 w-auto" />
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-white/75 hover:text-white">
          <ArrowLeft className="size-4" aria-hidden />
          Κατάλογος χώρων
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 pb-16 pt-4">
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_26rem]">
          <div className="hidden lg:block">
            <p className="font-display nums text-[7.5rem] font-medium leading-[0.8] text-stone-soft">1.1.1</p>
            <div className="animate-rule my-7 h-px w-full max-w-md bg-stone/70" aria-hidden />
            <p className="font-display max-w-md text-5xl font-semibold leading-[1.04]">Η πινακίδα μένει. Η σελίδα πίσω της ενημερώνεται.</p>
            <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-white/75">
              Διαχείριση των μόνιμων QR του Τμήματος Πολιτισμικής Τεχνολογίας και Επικοινωνίας.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-card text-ink shadow-[0_30px_80px_-30px_rgb(16_52_82/0.7)]">
            <div className="h-1.5 bg-stone" aria-hidden />
            <form onSubmit={submit} className="space-y-5 p-6 sm:p-8" noValidate>
              <div>
                <h1 className="font-display text-[2rem] font-semibold leading-tight lg:text-3xl">Είσοδος προσωπικού</h1>
                <p className="mt-1 text-[0.9375rem] text-muted">Με τον λογαριασμό που σας έδωσε ο διαχειριστής.</p>
              </div>

              {bootError ? <ErrorNotice message={bootError} /> : null}
              {error ? <ErrorNotice message={error} /> : null}

              <Field label="Email">
                {(p) => (
                  <TextInput
                    {...p}
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    placeholder="onoma@aegean.gr"
                  />
                )}
              </Field>
              <Field label="Κωδικός">
                {(p) => (
                  <div className="relative">
                    <TextInput
                      {...p}
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                      aria-pressed={show}
                      className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-paper hover:text-sea"
                    >
                      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                )}
              </Field>

              <Button type="submit" variant="sea" size="lg" loading={busy} disabled={!ready || !email || !password} className="w-full">
                {busy ? "Σύνδεση…" : "Σύνδεση"}
              </Button>
              <p className="text-center text-[0.8125rem] text-muted">Ξεχάσατε τον κωδικό; Ζητήστε νέο από τον διαχειριστή.</p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
