import { NextRequest, NextResponse } from "next/server";
import { orderPaySchema } from "@/schemas/order";
import { getById, markPaid } from "@/lib/db/orders";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "DRAFT") {
    return NextResponse.json({ error: "Order is not in DRAFT status" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = orderPaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { method, amountTendered, reference } = parsed.data;

  let changeDue = null;
  if (method === "CASH") {
    const total = Number(order.total);
    const tendered = Number(amountTendered);
    if (tendered < total) {
      return NextResponse.json(
        { error: "amountTendered must be greater than or equal to order total" },
        { status: 400 }
      );
    }
    changeDue = tendered - total;
    changeDue = Math.round(changeDue * 100) / 100;
  }

  try {
    const result = await markPaid(id, method, reference, changeDue);
    return NextResponse.json({
      data: {
        order: { status: result.order.status },
        receipt: result.receipt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
