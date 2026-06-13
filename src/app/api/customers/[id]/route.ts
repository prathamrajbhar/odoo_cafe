import { NextRequest, NextResponse } from "next/server";
import { customerUpdateSchema } from "@/schemas/customer";
import { getById, update, deleteCustomer } from "@/lib/db/customers";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = customerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  try {
    const customer = await update(id, parsed.data);
    return NextResponse.json({ data: { customer } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  try {
    await deleteCustomer(id);
    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
