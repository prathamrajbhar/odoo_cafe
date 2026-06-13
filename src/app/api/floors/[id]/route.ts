import { NextRequest, NextResponse } from "next/server";
import { updateFloorSchema } from "@/schemas/floor";
import { getFloorById, updateFloor, deleteFloor } from "@/lib/db/floors";

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

  const existing = await getFloorById(id);
  if (!existing) {
    return NextResponse.json({ error: "Floor not found" }, { status: 404 });
  }

  const floor = await updateFloor(id, parsed.data);
  return NextResponse.json({ data: { floor } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getFloorById(id);
  if (!existing) {
    return NextResponse.json({ error: "Floor not found" }, { status: 404 });
  }

  try {
    await deleteFloor(id);
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Floor has tables — remove them first" }, { status: 400 });
    }
    throw e;
  }
  return NextResponse.json({ data: { success: true } });
}
