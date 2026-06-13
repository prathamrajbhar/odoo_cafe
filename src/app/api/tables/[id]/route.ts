import { NextRequest, NextResponse } from "next/server";
import { updateTableSchema } from "@/schemas/table";
import { getById, update, deleteTable } from "@/lib/db/tables";

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

  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    const table = await update(id, parsed.data);
    return NextResponse.json({ data: { table } });
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
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    await deleteTable(id);
    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Table has orders — cannot delete" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

