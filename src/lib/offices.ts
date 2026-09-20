import type { LocalizedOffice, Office } from "./types";
import { getSupabase } from "./supabase";

type OfficeRow = {
  id: string;
  code: string;
  building_code: string;
  building_id: string | null;
  published: boolean;
  kind: Office["kind"];
  phone: string | null;
  email: string | null;
  el: LocalizedOffice;
  en: LocalizedOffice;
};

function rowToOffice(row: OfficeRow): Office {
  return {
    id: row.id,
    code: row.code || "",
    buildingCode: row.building_code || "",
    buildingId: row.building_id ?? undefined,
    published: Boolean(row.published),
    kind: row.kind,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    el: row.el,
    en: row.en,
  };
}

function officeToRow(o: Office): OfficeRow {
  return {
    id: String(o.id || "").trim(),
    code: o.code || "",
    building_code: o.buildingCode || "",
    building_id: o.buildingId ?? null,
    published: Boolean(o.published),
    kind: o.kind,
    phone: o.phone ?? null,
    email: o.email ?? null,
    el: o.el,
    en: o.en,
  };
}

export async function readOffices(): Promise<Office[]> {
  const { data, error } = await getSupabase()
    .from("offices")
    .select("*")
    .order("code", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as OfficeRow[]).map(rowToOffice);
}

export async function writeOffices(offices: Office[]): Promise<void> {
  const normalized = offices.map(officeToRow);
  if (normalized.some((o) => !o.id)) {
    throw new Error("Every office needs an id.");
  }
  const ids = normalized.map((o) => o.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate office ids.");
  }

  const db = getSupabase();
  const { error: upsertError } = await db.from("offices").upsert(normalized);
  if (upsertError) throw new Error(upsertError.message);

  const { data: existing, error: listError } = await db
    .from("offices")
    .select("id");
  if (listError) throw new Error(listError.message);

  const keep = new Set(ids);
  const toDelete = ((existing || []) as { id: string }[])
    .map((r) => r.id)
    .filter((id) => !keep.has(id));

  if (toDelete.length) {
    const { error: delError } = await db.from("offices").delete().in("id", toDelete);
    if (delError) throw new Error(delError.message);
  }
}

export async function getOffice(slug: string): Promise<Office | undefined> {
  const key = decodeURIComponent(slug).trim();
  if (!key) return undefined;

  const db = getSupabase();

  const byCode = await db.from("offices").select("*").eq("code", key).maybeSingle();
  if (byCode.error) throw new Error(byCode.error.message);
  if (byCode.data) return rowToOffice(byCode.data as OfficeRow);

  const byId = await db.from("offices").select("*").eq("id", key).maybeSingle();
  if (byId.error) throw new Error(byId.error.message);
  return byId.data ? rowToOffice(byId.data as OfficeRow) : undefined;
}
