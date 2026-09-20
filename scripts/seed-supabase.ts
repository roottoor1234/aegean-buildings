/**
 * Seed Supabase from local JSON (one-time / reset).
 * Usage: npx tsx scripts/seed-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

type Building = {
  id: string;
  published: boolean;
  buildingCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  lat?: number;
  lng?: number;
  el: unknown;
  en: unknown;
};

type Office = {
  id: string;
  code: string;
  buildingCode: string;
  buildingId?: string;
  published: boolean;
  kind: string;
  phone?: string;
  email?: string;
  el: unknown;
  en: unknown;
};

async function main() {
  const db = createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const root = process.cwd();
  const buildings = JSON.parse(
    readFileSync(path.join(root, "data", "buildings.json"), "utf8"),
  ) as Building[];
  const offices = JSON.parse(
    readFileSync(path.join(root, "data", "offices.json"), "utf8"),
  ) as Office[];

  const buildingRows = buildings.map((b) => ({
    id: b.id,
    published: Boolean(b.published),
    building_code: b.buildingCode ?? null,
    phone: b.phone ?? null,
    email: b.email ?? null,
    website: b.website ?? null,
    lat: b.lat ?? null,
    lng: b.lng ?? null,
    el: b.el,
    en: b.en,
  }));

  const officeRows = offices.map((o) => ({
    id: o.id,
    code: o.code || "",
    building_code: o.buildingCode || "",
    building_id: o.buildingId ?? null,
    published: Boolean(o.published),
    kind: o.kind,
    phone: o.phone ?? null,
    email: o.email ?? null,
    el: o.el,
    en: o.en,
  }));

  const { error: bErr } = await db.from("buildings").upsert(buildingRows);
  if (bErr) throw new Error(`buildings: ${bErr.message}`);

  const { error: oErr } = await db.from("offices").upsert(officeRows);
  if (oErr) throw new Error(`offices: ${oErr.message}`);

  console.log(`Seeded ${buildingRows.length} buildings, ${officeRows.length} offices.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
