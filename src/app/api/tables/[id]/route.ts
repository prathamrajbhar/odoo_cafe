import { NextRequest, NextResponse } from "next/server";
import { updateTableSchema } from "@/schemas/table";
import { getTableById, updateTable, deleteTable } from "@/lib/db/tables";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateTableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getTableById(id);
  if (!existing) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    const table = await updateTable(id, parsed.data);
    return NextResponse.json({ data: { table } });
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Table number already exists on this floor" },
        { status: 400 }
      );
    }
    throw e;
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getTableById(id);
  if (!existing) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    await deleteTable(id);
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Table has orders — cannot delete" }, { status: 400 });
    }
    throw e;
  }
  return NextResponse.json({ data: { success: true } });
}
