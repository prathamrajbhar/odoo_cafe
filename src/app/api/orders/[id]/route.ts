import { NextRequest, NextResponse } from "next/server";
import { getById, deleteOrder, update } from "@/lib/db/orders";
import { orderCreateSchema } from "@/schemas/order";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { orderLines, ...rest } = order;
  return NextResponse.json({ data: { order: { ...rest, lines: orderLines } } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteOrder(id);
    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "x-user-id header is missing" }, { status: 400 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = orderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  try {
    const order = await update(id, { ...parsed.data, employeeId: userId });
    return NextResponse.json({ data: { order } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
