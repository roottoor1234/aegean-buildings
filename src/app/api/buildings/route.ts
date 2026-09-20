import { NextResponse } from "next/server";
import { readBuildings, writeBuildings } from "@/lib/buildings";
import type { Building } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const buildings = await readBuildings();
  return NextResponse.json(buildings);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Building[];
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of buildings." }, { status: 400 });
    }
    await writeBuildings(body);
    return NextResponse.json({ ok: true, count: body.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
