import { NextRequest, NextResponse } from "next/server";
import { createProductSchema } from "@/schemas/product";
import { listProducts, createProduct } from "@/lib/db/products";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ data: { products } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const product = await createProduct(parsed.data);
  return NextResponse.json({ data: { product } }, { status: 201 });
}
