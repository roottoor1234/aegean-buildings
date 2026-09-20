import type { Building, BuildingsFile, LocalizedBuilding } from "./types";
import { getSupabase } from "./supabase";

type BuildingRow = {
  id: string;
  published: boolean;
  building_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  el: LocalizedBuilding;
  en: LocalizedBuilding;
};

function rowToBuilding(row: BuildingRow): Building {
  return {
    id: row.id,
    published: Boolean(row.published),
    buildingCode: row.building_code ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    el: row.el,
    en: row.en,
  };
}

function buildingToRow(b: Building): BuildingRow {
  return {
    id: String(b.id || "").trim(),
    published: Boolean(b.published),
    building_code: b.buildingCode ?? null,
    phone: b.phone ?? null,
    email: b.email ?? null,
    website: b.website ?? null,
    lat: b.lat ?? null,
    lng: b.lng ?? null,
    el: b.el,
    en: b.en,
  };
}

export async function readBuildings(): Promise<BuildingsFile> {
  const { data, error } = await getSupabase()
    .from("buildings")
    .select("*")
    .order("building_code", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as BuildingRow[]).map(rowToBuilding);
}

export async function writeBuildings(buildings: BuildingsFile): Promise<void> {
  const normalized = buildings.map(buildingToRow);
  if (normalized.some((b) => !b.id)) {
    throw new Error("Every building needs an id.");
  }
  const ids = normalized.map((b) => b.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate building ids.");
  }

  const db = getSupabase();
  const { error: upsertError } = await db.from("buildings").upsert(normalized);
  if (upsertError) throw new Error(upsertError.message);

  const { data: existing, error: listError } = await db
    .from("buildings")
    .select("id");
  if (listError) throw new Error(listError.message);

  const keep = new Set(ids);
  const toDelete = ((existing || []) as { id: string }[])
    .map((r) => r.id)
    .filter((id) => !keep.has(id));

  if (toDelete.length) {
    const { error: delError } = await db
      .from("buildings")
      .delete()
      .in("id", toDelete);
    if (delError) throw new Error(delError.message);
  }
}

export async function getBuilding(slug: string): Promise<Building | undefined> {
  const key = decodeURIComponent(slug).trim();
  if (!key) return undefined;

  const db = getSupabase();

  const byCode = await db
    .from("buildings")
    .select("*")
    .eq("building_code", key)
    .maybeSingle();
  if (byCode.error) throw new Error(byCode.error.message);
  if (byCode.data) return rowToBuilding(byCode.data as BuildingRow);

  const byId = await db.from("buildings").select("*").eq("id", key).maybeSingle();
  if (byId.error) throw new Error(byId.error.message);
  return byId.data ? rowToBuilding(byId.data as BuildingRow) : undefined;
}

export {
  buildingPath,
  buildingUrl,
  officePath,
  officeUrl,
  officeSlug,
  buildingSlug,
} from "./paths";
