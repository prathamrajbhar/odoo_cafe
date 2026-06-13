import { NextRequest, NextResponse } from "next/server";
import { createTableSchema } from "@/schemas/table";
import { listTables, createTable } from "@/lib/db/tables";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawTables = await listTables();
  const tables = rawTables.map(({ orders, ...t }) => ({
    ...t,
    hasActiveOrder: orders.length > 0,
  }));
  return NextResponse.json({ data: { tables } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createTableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  try {
    const table = await createTable(parsed.data);
    return NextResponse.json({ data: { table } }, { status: 201 });
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
