import { NextRequest, NextResponse } from "next/server";
import { productCreateSchema } from "@/schemas/product";
import { getAll, create } from "@/lib/db/products";
import { getById as getCategoryById } from "@/lib/db/categories";

export async function GET() {
  const products = await getAll(false);
  return NextResponse.json({ data: { products } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, categoryId, price, taxRate, description } = parsed.data;

  // Verify category exists
  const categoryExists = await getCategoryById(categoryId);
  if (!categoryExists) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const product = await create(name, categoryId, price, taxRate, description);
  return NextResponse.json({ data: { product } }, { status: 201 });
}
