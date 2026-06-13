import { NextRequest, NextResponse } from "next/server";
import { productUpdateSchema } from "@/schemas/product";
import { getById, update, archive } from "@/lib/db/products";
import { getById as getCategoryById } from "@/lib/db/categories";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (parsed.data.categoryId) {
    const categoryExists = await getCategoryById(parsed.data.categoryId);
    if (!categoryExists) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
  }

  const product = await update(id, parsed.data);
  return NextResponse.json({ data: { product } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await archive(id);
  return NextResponse.json({ data: { success: true } });
}
