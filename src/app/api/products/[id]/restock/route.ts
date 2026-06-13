import { NextRequest, NextResponse } from "next/server";
import { productRestockSchema } from "@/schemas/product";
import { getById, restockProduct } from "@/lib/db/products";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = productRestockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const product = await restockProduct(id, parsed.data.quantity);
  return NextResponse.json({ data: { product } });
}
