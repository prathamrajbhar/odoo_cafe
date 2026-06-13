import { NextRequest, NextResponse } from "next/server";
import { getById, updateStatus } from "@/lib/db/orders";

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
    return NextResponse.json({ error: "Only DRAFT orders can be cancelled" }, { status: 400 });
  }

  await updateStatus(id, "CANCELLED");
  return NextResponse.json({ data: { success: true } });
}
