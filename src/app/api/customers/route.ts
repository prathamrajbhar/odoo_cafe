import { NextRequest, NextResponse } from "next/server";
import { customerCreateSchema } from "@/schemas/customer";
import { getAll, create } from "@/lib/db/customers";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;

  const customers = await getAll(search);
  return NextResponse.json({ data: { customers } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = customerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  try {
    const customer = await create(parsed.data);
    return NextResponse.json({ data: { customer } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
