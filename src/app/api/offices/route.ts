import { NextResponse } from "next/server";
import { readOffices, writeOffices } from "@/lib/offices";
import type { Office } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readOffices());
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Office[];
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of offices." }, { status: 400 });
    }
    await writeOffices(body);
    return NextResponse.json({ ok: true, count: body.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
