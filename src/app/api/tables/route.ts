import { NextRequest, NextResponse } from "next/server";
import { createTableSchema } from "@/schemas/table";
import { getAll, create } from "@/lib/db/tables";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tables = await getAll();
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
    const table = await create(parsed.data);
    return NextResponse.json({ data: { table } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

