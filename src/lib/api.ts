import type { Activity, Building, Office, User } from "./types";

const BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

let csrfToken = "";

export function setCsrf(token: string) {
  csrfToken = token;
}

export class ApiError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status: number, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(method: Method, path: string, body?: unknown, retried = false): Promise<T> {
  let res: Response;
  try {
    // PUT/DELETE travel as POST + override header: shared hosts often block those verbs outright
    const override = method === "PUT" || method === "DELETE";
    res = await fetch(`${BASE}/${path}`, {
      method: override ? "POST" : method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(override ? { "X-HTTP-Method-Override": method } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(method !== "GET" && csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Δεν υπάρχει σύνδεση με τον διακομιστή.", 0);
  }

  // Ληγμένο CSRF token: ανανέωση μία φορά και επανάληψη
  if (res.status === 419 && !retried) {
    const me = await request<{ csrf: string }>("GET", "auth/me.php");
    setCsrf(me.csrf);
    return request<T>(method, path, body, true);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(
      res.status === 403
        ? "Ο διακομιστής απέρριψε το αίτημα (403). Ενημερώστε τον διαχειριστή του συστήματος."
        : `Μη αναμενόμενη απάντηση από τον διακομιστή (${res.status}). Δοκιμάστε ξανά.`,
      res.status,
    );
  }
  if (!res.ok) {
    const err = (data ?? {}) as { error?: string; field?: string };
    throw new ApiError(err.error || `Σφάλμα ${res.status}`, res.status, err.field);
  }
  return data as T;
}

const enc = encodeURIComponent;

export const api = {
  // public
  directory: () => request<{ buildings: Building[]; offices: Office[] }>("GET", "public/directory.php"),
  publicOffice: (slug: string) =>
    request<{ office: Office; building: Building | null }>("GET", `public/office.php?slug=${enc(slug)}`),
  publicBuilding: (slug: string) =>
    request<{ building: Building; offices: Office[] }>("GET", `public/building.php?slug=${enc(slug)}`),

  // auth
  me: () => request<{ user: User | null; csrf: string }>("GET", "auth/me.php"),
  login: (email: string, password: string) =>
    request<{ user: User; csrf: string }>("POST", "auth/login.php", { email, password }),
  logout: () => request<{ ok: true }>("POST", "auth/logout.php", {}),
  changePassword: (current: string, next: string) =>
    request<{ ok: true }>("POST", "auth/password.php", { current, next }),

  // offices
  offices: () => request<Office[]>("GET", "offices.php"),
  office: (id: string) => request<Office>("GET", `offices.php?id=${enc(id)}`),
  createOffice: (o: Office) => request<Office>("POST", "offices.php", o),
  updateOffice: (o: Office) => request<Office>("PUT", `offices.php?id=${enc(o.id)}`, o),
  deleteOffice: (id: string) => request<{ ok: true }>("DELETE", `offices.php?id=${enc(id)}`),

  // buildings
  buildings: () => request<Building[]>("GET", "buildings.php"),
  building: (id: string) => request<Building>("GET", `buildings.php?id=${enc(id)}`),
  createBuilding: (b: Building) => request<Building>("POST", "buildings.php", b),
  updateBuilding: (b: Building) => request<Building>("PUT", `buildings.php?id=${enc(b.id)}`, b),
  deleteBuilding: (id: string) => request<{ ok: true }>("DELETE", `buildings.php?id=${enc(id)}`),

  // users
  users: () => request<User[]>("GET", "users.php"),
  createUser: (u: Partial<User> & { password: string }) => request<User>("POST", "users.php", u),
  updateUser: (id: number, u: Partial<User> & { password?: string }) =>
    request<User>("PUT", `users.php?id=${id}`, u),
  deleteUser: (id: number) => request<{ ok: true }>("DELETE", `users.php?id=${id}`),

  activity: (limit = 20) => request<Activity[]>("GET", `activity.php?limit=${limit}`),
};
