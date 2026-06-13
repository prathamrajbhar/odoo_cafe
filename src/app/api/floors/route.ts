import { NextRequest, NextResponse } from "next/server";
import { createFloorSchema } from "@/schemas/floor";
import { listFloors, createFloor } from "@/lib/db/floors";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const floors = await listFloors();
  return NextResponse.json({ data: { floors } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createFloorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const floor = await createFloor(parsed.data);
  return NextResponse.json({ data: { floor } }, { status: 201 });
}
