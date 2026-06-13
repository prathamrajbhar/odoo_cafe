import { NextRequest, NextResponse } from "next/server";
import { updateFloorSchema } from "@/schemas/floor";
import { getById, update, deleteFloor } from "@/lib/db/floors";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateFloorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Floor not found" }, { status: 404 });
  }

  try {
    const floor = await update(id, parsed.data);
    return NextResponse.json({ data: { floor } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Floor not found" }, { status: 404 });
  }

  try {
    await deleteFloor(id);
    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

