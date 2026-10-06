import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Building2, DoorOpen, ExternalLink, KeyRound, LayoutDashboard, LogOut, Menu, QrCode, Users, X } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { cx } from "@/components/ui";
import type { Role } from "@/lib/types";

const logo = `${import.meta.env.BASE_URL}assets/logo-aegean.png`;

type NavItem = { to: string; label: string; icon: ReactNode; roles: Role[]; end?: boolean };

const NAV: NavItem[] = [
  { to: "/admin", label: "Επισκόπηση", icon: <LayoutDashboard className="size-[18px]" />, roles: ["admin", "user"], end: true },
  { to: "/admin/plaques", label: "Πινακίδες QR", icon: <QrCode className="size-[18px]" />, roles: ["admin", "user"] },
  { to: "/admin/spaces", label: "Χώροι", icon: <DoorOpen className="size-[18px]" />, roles: ["admin"] },
  { to: "/admin/buildings", label: "Κτίρια", icon: <Building2 className="size-[18px]" />, roles: ["admin"] },
  { to: "/admin/users", label: "Χρήστες", icon: <Users className="size-[18px]" />, roles: ["admin"] },
];

export const ROLE_LABEL: Record<Role, string> = { admin: "Διαχειριστής", user: "Χρήστης προβολής" };

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!user) return null;
  const items = NAV.filter((n) => n.roles.includes(user.role));

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const nav = (
    <nav aria-label="Διαχείριση" className="flex flex-1 flex-col gap-6">
      <ul className="space-y-0.5">
        {items.map((n) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cx(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-semibold transition-colors",
                  isActive ? "bg-white/[0.09] text-white" : "text-white/75 hover:bg-white/[0.05] hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-stone-soft" : ""}>{n.icon}</span>
                  {n.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-0.5 border-t border-white/10 pt-4">
        <div className="px-3 pb-3">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-[0.8125rem] text-white/75">{ROLE_LABEL[user.role]}</p>
        </div>
        <SideLink to="/admin/account" icon={<KeyRound className="size-[18px]" />}>
          Ο λογαριασμός μου
        </SideLink>
        <a
          href={`${import.meta.env.BASE_URL}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-semibold text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <ExternalLink className="size-[18px]" />
          Δημόσιος κατάλογος
        </a>
        <button
          type="button"
          onClick={signOut}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[0.9375rem] font-semibold text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut className="size-[18px]" />
          Αποσύνδεση
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <div className="hidden bg-sea-deep lg:block">
      <aside className="on-sea sticky top-0 flex h-dvh flex-col px-3 py-5 text-white">
        <Link to="/admin" className="mb-7 block rounded-md px-3">
          <img src={logo} alt="Πανεπιστήμιο Αιγαίου" width={228} height={83} className="h-9 w-auto" />
          <span className="mt-2.5 block text-[0.8125rem] font-semibold text-white/75">Ψηφιακή Σήμανση ΤΠΤΕ</span>
        </Link>
        {nav}
      </aside>
      </div>

      {/* Mobile bar */}
      <div className="on-sea sticky top-0 z-30 flex h-14 items-center justify-between bg-sea-deep px-4 text-white lg:hidden">
        <Link to="/admin" className="rounded-md">
          <img src={logo} alt="Πανεπιστήμιο Αιγαίου" width={228} height={83} className="h-8 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Μενού"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-lg text-white hover:bg-white/10"
        >
          <Menu className="size-5" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Μενού">
          <div className="absolute inset-0 bg-sea-deep/50" onClick={() => setOpen(false)} aria-hidden />
          <div className="on-sea animate-rise absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col bg-sea-deep px-3 py-4 text-white shadow-[var(--shadow-lift)]">
            <div className="mb-5 flex items-center justify-between px-3">
              <span className="text-sm font-semibold text-white/75">Ψηφιακή Σήμανση ΤΠΤΕ</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Κλείσιμο" className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

function SideLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "flex h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-semibold transition-colors",
          isActive ? "bg-white/[0.09] text-white" : "text-white/75 hover:bg-white/[0.05] hover:text-white",
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

/** Page frame inside the back office: title row, optional actions, content. */
export function AdminPage({
  title,
  description,
  actions,
  back,
  children,
  wide,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cx("mx-auto px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10", wide ? "max-w-[90rem]" : "max-w-6xl")}>
      {back ? <div className="mb-3">{back}</div> : null}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 lg:mb-8">
        <div className="min-w-0">
          <h1 className="font-display text-[2rem] font-semibold leading-tight text-ink lg:text-[2.5rem]">{title}</h1>
          {description ? <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
