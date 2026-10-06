import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { api, setCsrf } from "@/lib/api";
import type { Role, User } from "@/lib/types";
import { Spinner, ToastProvider } from "@/components/ui";

type AuthState = {
  user: User | null;
  ready: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  can: (action: "edit" | "manageUsers") => boolean;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.me().then(
      (r) => {
        setCsrf(r.csrf);
        setUser(r.user);
        setReady(true);
      },
      (e: Error) => {
        setError(e.message);
        setReady(true);
      },
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.login(email, password);
    setCsrf(r.csrf);
    setUser(r.user);
    setError(null);
    return r.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      const me = await api.me().catch(() => null);
      if (me) setCsrf(me.csrf);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      error,
      login,
      logout,
      // Role → capability. "user" is view-only: browse and download plaques.
      can: (action) => user?.role === "admin" && (action === "edit" || action === "manageUsers"),
    }),
    [user, ready, error, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

/** Layout route for /login and /admin: one session check, shared toasts. */
export function AuthRoot() {
  useEffect(() => {
    // Google Translate mutates the DOM and breaks React updates in the back office.
    document.documentElement.classList.add("notranslate");
    document.documentElement.lang = "el";
    return () => document.documentElement.classList.remove("notranslate");
  }, []);
  return (
    <AuthProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </AuthProvider>
  );
}

export function RequireRole({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner label="Έλεγχος συνεδρίας…" />
      </div>
    );
  }
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
